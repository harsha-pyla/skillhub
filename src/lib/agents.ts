import path from 'path';
import os from 'os';

// NOTE: These paths must be verified in each agent's official docs.
export const agentPaths = {
  claude: {
    local: '.claude/skills',
    global: path.join(os.homedir(), '.claude', 'skills')
  },
  codex: {
    local: '.codex/skills',
    global: path.join(os.homedir(), '.codex', 'skills')
  },
  copilot: {
    local: '.github/copilot/skills',
    global: path.join(os.homedir(), '.copilot', 'skills')
  },
  gemini: {
    local: '.agents/skills',
    global: path.join(os.homedir(), '.gemini', 'config', 'skills')
  }
} as const;

export type AgentType = keyof typeof agentPaths;
