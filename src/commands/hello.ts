import { Command } from 'commander';

export const helloCommand = new Command('hello')
  .description('Prints a hello message')
  .action(() => {
    // Print the requested message
    console.log('skillhub works');
  });
