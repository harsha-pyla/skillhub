import { Command } from 'commander';
import { validateSkill } from '../lib/validator.js';

export const validateCommand = new Command('validate')
  .description('Validate a skill directory (checks SKILL.md frontmatter)')
  .argument('[dir]', 'Directory containing the skill', '.')
  .action((dir: string) => {
    const isValid = validateSkill(dir);
    if (!isValid) {
      process.exit(1);
    }
  });
