import { Command } from 'commander';
import path from 'path';
import { execSync } from 'child_process';
import { agentPaths, AgentType } from '../lib/agents.js';
import { getLockfilePath, readLockfile } from '../lib/lockfile.js';
import { installSkill } from '../lib/installer.js';

export const updateCommand = new Command('update')
  .description('Update an installed skill to the latest version')
  .argument('[name]', 'Name of the skill to update (leave blank to update all)')
  .option('-a, --agent <agent>', 'Target agent (claude, codex, copilot, gemini)', 'claude')
  .option('-g, --global', 'Update globally installed skills')
  .action((name: string | undefined, options: { agent: string, global?: boolean }) => {
    const agent = options.agent as AgentType;
    if (!agentPaths[agent]) {
      console.error(`Error: Unsupported agent '${agent}'.`);
      process.exit(1);
    }

    const basePath = options.global ? agentPaths[agent].global : path.join(process.cwd(), agentPaths[agent].local);
    const lockfilePath = getLockfilePath(basePath);
    const data = readLockfile(lockfilePath);

    const skillsToUpdate = name ? [name] : Object.keys(data.skills);

    if (skillsToUpdate.length === 0) {
      console.log('No skills found to update.');
      return;
    }

    for (const skillName of skillsToUpdate) {
      const skill = data.skills[skillName];
      if (!skill) {
        console.error(`Error: Skill '${skillName}' not found in lockfile.`);
        continue;
      }

      console.log(`Checking updates for '${skillName}'...`);
      const match = skill.sourceUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;
      
      const [, owner, repo] = match;
      const remoteUrl = `https://github.com/${owner}/${repo}.git`;
      
      try {
        const remoteOutput = execSync(`git ls-remote ${remoteUrl} HEAD`).toString();
        const remoteHash = remoteOutput.split('\t')[0];
        
        if (remoteHash && remoteHash !== skill.commitHash) {
          console.log(`New version found for '${skillName}'. Updating...`);
          installSkill(skill.sourceUrl, agent, !!options.global);
        } else {
          console.log(`Skill '${skillName}' is already up to date.`);
        }
      } catch (err: any) {
        console.error(`Failed to check updates for '${skillName}': ${err.message}`);
      }
    }
  });
