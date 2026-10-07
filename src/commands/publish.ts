import { Command } from 'commander';
import { validateSkill } from '../lib/validator.js';

export const publishCommand = new Command('publish')
  .description('Validate and get instructions to publish a skill')
  .argument('[dir]', 'Directory containing the skill to publish', '.')
  .action((dir: string) => {
    console.log('Running validation before publishing...');
    const isValid = validateSkill(dir);
    if (!isValid) {
      console.error('\nCannot publish: Validation failed. Please fix the errors above.');
      process.exit(1);
    }

    console.log('\n🚀 Your skill is ready to be published!');
    console.log('\nTo submit your skill to the registry, follow these steps:');
    console.log('1. Ensure your skill is pushed to a public GitHub repository.');
    console.log('2. Fork the skillhub repository: https://github.com/harsha-pyla/skillhub');
    console.log('3. Add your skill to the registry/index.json file in your fork.');
    console.log('   Example entry:');
    console.log('   {');
    console.log('     "name": "your-skill-name",');
    console.log('     "description": "your-description",');
    console.log('     "tags": ["tag1", "tag2"],');
    console.log('     "url": "https://github.com/your-username/your-repo"');
    console.log('   }');
    console.log('4. Commit your changes and push to your fork.');
    console.log('5. Open a Pull Request against the main skillhub repository.');
    console.log('\nOnce your PR is merged, users can install your skill via `skillhub install <name>`!');
  });
