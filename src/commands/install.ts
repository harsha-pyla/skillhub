import { Command } from 'commander';
import { agentPaths, AgentType } from '../lib/agents.js';
import { installSkill } from '../lib/installer.js';

export const installCommand = new Command('install')
  .description('Install a skill from a GitHub URL')
  .argument('<url>', 'GitHub URL of the skill repository or folder')
  .option('-a, --agent <agent>', 'Target agent (claude, codex, copilot, gemini)', 'claude')
  .option('-g, --global', 'Install globally in the home directory')
  .action((url: string, options: { agent: string, global?: boolean }) => {
    try {
      const agent = options.agent as AgentType;
      if (!agentPaths[agent]) {
        console.error(`Error: Unsupported agent '${agent}'. Supported agents are: ${Object.keys(agentPaths).join(', ')}`);
        process.exit(1);
      }
      installSkill(url, agent, !!options.global);
    } catch (err: any) {
      console.error('Error installing skill:', err.message);
      process.exit(1);
    }
  });
