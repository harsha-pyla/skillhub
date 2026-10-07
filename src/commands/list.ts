import { Command } from 'commander';
import path from 'path';
import { agentPaths, AgentType } from '../lib/agents.js';
import { getLockfilePath, readLockfile } from '../lib/lockfile.js';

export const listCommand = new Command('list')
  .description('List all installed skills')
  .option('-a, --agent <agent>', 'Target agent (claude, codex, copilot, gemini)', 'claude')
  .option('-g, --global', 'List globally installed skills')
  .action((options: { agent: string, global?: boolean }) => {
    const agent = options.agent as AgentType;
    if (!agentPaths[agent]) {
      console.error(`Error: Unsupported agent '${agent}'.`);
      process.exit(1);
    }

    const basePath = options.global ? agentPaths[agent].global : path.join(process.cwd(), agentPaths[agent].local);
    const lockfilePath = getLockfilePath(basePath);

    const data = readLockfile(lockfilePath);
    const skills = Object.values(data.skills);

    if (skills.length === 0) {
      console.log(`No skills found for agent '${agent}' in ${options.global ? 'global' : 'local'} scope.`);
      return;
    }

    console.log(`Installed skills for '${agent}' (${options.global ? 'global' : 'local'}):`);
    skills.forEach(skill => {
      console.log(`- ${skill.name}`);
      console.log(`  URL: ${skill.sourceUrl}`);
      console.log(`  Commit: ${skill.commitHash}`);
      console.log(`  Installed: ${new Date(skill.installedDate).toLocaleString()}`);
    });
  });
