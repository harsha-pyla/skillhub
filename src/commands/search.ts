import { Command } from 'commander';
import { fetchRegistry } from '../lib/registry.js';

export const searchCommand = new Command('search')
  .description('Search for a skill in the registry')
  .argument('<word>', 'Search keyword')
  .action(async (word: string) => {
    try {
      console.log(`Searching registry for '${word}'...`);
      const registry = await fetchRegistry();
      
      const keyword = word.toLowerCase();
      const results = registry.filter(skill => 
        skill.name.toLowerCase().includes(keyword) ||
        skill.description.toLowerCase().includes(keyword) ||
        skill.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
      
      if (results.length === 0) {
        console.log('No matching skills found.');
        return;
      }
      
      console.log(`Found ${results.length} matching skill(s):`);
      results.forEach(skill => {
        console.log(`\n- ${skill.name}`);
        console.log(`  Description: ${skill.description}`);
        console.log(`  Tags: ${skill.tags.join(', ')}`);
        console.log(`  URL: ${skill.url}`);
      });
      
    } catch (err: any) {
      console.error('Error searching registry:', err.message);
      process.exit(1);
    }
  });
