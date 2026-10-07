import { Command } from 'commander';
import { agentPaths, AgentType } from '../lib/agents.js';
import { installSkill } from '../lib/installer.js';
import { fetchRegistry } from '../lib/registry.js';

export const installCommand = new Command('install')
  .description('Install a skill from a GitHub URL or registry name')
  .argument('<url_or_name>', 'GitHub URL of the skill repository or short name')
  .option('-a, --agent <agent>', 'Target agent (claude, codex, copilot, gemini)', 'claude')
  .option('-g, --global', 'Install globally in the home directory')
  .action(async (urlOrName: string, options: { agent: string, global?: boolean }) => {
    try {
      const agent = options.agent as AgentType;
      if (!agentPaths[agent]) {
        console.error(`Error: Unsupported agent '${agent}'. Supported agents are: ${Object.keys(agentPaths).join(', ')}`);
        process.exit(1);
      }
      
      let finalUrl = urlOrName;
      
      // If it doesn't look like a github URL, assume it's a short name
      if (!urlOrName.includes('github.com')) {
        console.log(`'${urlOrName}' is not a GitHub URL. Checking registry...`);
        const registry = await fetchRegistry();
        const entry = registry.find(s => s.name === urlOrName);
        if (!entry) {
          console.error(`Error: Skill '${urlOrName}' not found in registry.`);
          process.exit(1);
        }
        finalUrl = entry.url;
        console.log(`Found '${urlOrName}' in registry! Target URL: ${finalUrl}`);
      }

      installSkill(finalUrl, agent, !!options.global);
    } catch (err: any) {
      console.error('Error installing skill:', err.message);
      process.exit(1);
    }
  });
