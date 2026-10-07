import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { agentPaths, AgentType } from '../lib/agents.js';
import { getLockfilePath, readLockfile, writeLockfile } from '../lib/lockfile.js';

export const removeCommand = new Command('remove')
  .description('Remove an installed skill')
  .argument('<name>', 'Name of the skill to remove')
  .option('-a, --agent <agent>', 'Target agent (claude, codex, copilot, gemini)', 'claude')
  .option('-g, --global', 'Remove globally installed skill')
  .action((name: string, options: { agent: string, global?: boolean }) => {
    const agent = options.agent as AgentType;
    if (!agentPaths[agent]) {
      console.error(`Error: Unsupported agent '${agent}'.`);
      process.exit(1);
    }

    const basePath = options.global ? agentPaths[agent].global : path.join(process.cwd(), agentPaths[agent].local);
    const destDir = path.join(basePath, name);
    
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
      console.log(`Deleted skill folder for '${name}'.`);
    } else {
      console.log(`Skill folder for '${name}' not found at ${destDir}.`);
    }

    const lockfilePath = getLockfilePath(basePath);
    const data = readLockfile(lockfilePath);
    
    if (data.skills[name]) {
      delete data.skills[name];
      writeLockfile(lockfilePath, data);
      console.log(`Removed '${name}' from lockfile.`);
    }
    
    console.log(`Successfully removed skill '${name}'.`);
  });
