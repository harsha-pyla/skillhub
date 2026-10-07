#!/usr/bin/env node
import { Command } from 'commander';
import { helloCommand } from './commands/hello.js';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';
import { updateCommand } from './commands/update.js';
import { removeCommand } from './commands/remove.js';
import { searchCommand } from './commands/search.js';
import { validateCommand } from './commands/validate.js';
import { publishCommand } from './commands/publish.js';

const program = new Command();

program
  .name('skillhub')
  .description('A sample CLI project')
  .version('1.0.0');

// Register commands
program.addCommand(helloCommand);
program.addCommand(installCommand);
program.addCommand(listCommand);
program.addCommand(updateCommand);
program.addCommand(removeCommand);
program.addCommand(searchCommand);
program.addCommand(validateCommand);
program.addCommand(publishCommand);

program.parse();
