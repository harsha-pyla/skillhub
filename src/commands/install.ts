import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { agentPaths, AgentType } from '../lib/agents.js';

export const installCommand = new Command('install')
  .description('Install a skill from a GitHub URL')
  .argument('<url>', 'GitHub URL of the skill repository or folder')
  .option('-a, --agent <agent>', 'Target agent (claude, codex, copilot, gemini)', 'claude')
  .option('-g, --global', 'Install globally in the home directory')
  .action((url: string, options: { agent: string, global?: boolean }) => {
    let tempDir = '';
    try {
      // Validate agent
      const agent = options.agent as AgentType;
      if (!agentPaths[agent]) {
        console.error(`Error: Unsupported agent '${agent}'. Supported agents are: ${Object.keys(agentPaths).join(', ')}`);
        process.exit(1);
      }

      // Basic URL parser
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+\/(.+))?/);
      if (!match) {
        console.error('Error: Invalid GitHub URL. Must be a github.com URL.');
        process.exit(1);
      }
      
      const [, owner, repo, subfolder] = match;
      const skillName = subfolder ? path.basename(subfolder) : repo;
      
      // Create temp directory for cloning
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillhub-'));
      
      console.log(`Downloading ${owner}/${repo}...`);
      
      // Clone the repo (using --depth 1 to speed it up)
      const cloneUrl = `https://github.com/${owner}/${repo}.git`;
      execSync(`git clone --depth 1 ${cloneUrl} "${tempDir}"`, { stdio: 'ignore' });
      
      // Resolve the actual path (root repo or a subfolder)
      const sourcePath = subfolder ? path.join(tempDir, subfolder) : tempDir;
      
      // Check that SKILL.md exists in the source
      const skillMdPath = path.join(sourcePath, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) {
        console.error(`Error: SKILL.md not found in ${url}`);
        process.exit(1);
      }
      
      // Prepare destination directory based on agent config
      const basePath = options.global ? agentPaths[agent].global : path.join(process.cwd(), agentPaths[agent].local);
      const destDir = path.join(basePath, skillName);
      
      // Remove destination if it already exists to overwrite it
      if (fs.existsSync(destDir)) {
        console.log(`Skill '${skillName}' already exists. Overwriting...`);
        fs.rmSync(destDir, { recursive: true, force: true });
      }
      fs.mkdirSync(destDir, { recursive: true });
      
      // Copy files to the destination
      fs.cpSync(sourcePath, destDir, { recursive: true });
      
      console.log(`Success! Skill '${skillName}' installed at ${destDir}`);
      
    } catch (err: any) {
      console.error('Error installing skill:', err.message);
      process.exit(1);
    } finally {
      // Clean up the temporary directory
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });
