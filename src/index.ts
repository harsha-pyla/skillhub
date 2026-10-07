#!/usr/bin/env node
import { Command } from 'commander';
import { helloCommand } from './commands/hello.js';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('skillhub')
  .description('A sample CLI project')
  .version('1.0.0');

// Register commands
program.addCommand(helloCommand);
program.addCommand(installCommand);
program.addCommand(listCommand);

program.parse();
