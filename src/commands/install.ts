import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const installCommand = new Command('install')
  .description('Install a skill from a GitHub URL')
  .argument('<url>', 'GitHub URL of the skill repository or folder')
  .action((url: string) => {
    let tempDir = '';
    try {
      // Basic URL parser
      // Matches https://github.com/owner/repo or https://github.com/owner/repo/tree/main/subfolder
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
      
      // Prepare destination directory (.claude/skills/<skill-name>)
      const destDir = path.join(process.cwd(), '.claude', 'skills', skillName);
      
      // Remove destination if it already exists to overwrite it
      if (fs.existsSync(destDir)) {
        console.log(`Skill '${skillName}' already exists. Overwriting...`);
        fs.rmSync(destDir, { recursive: true, force: true });
      }
      fs.mkdirSync(destDir, { recursive: true });
      
      // Copy files to the destination
      fs.cpSync(sourcePath, destDir, { recursive: true });
      
      console.log(`Success! Skill '${skillName}' installed at .claude/skills/${skillName}`);
      
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
