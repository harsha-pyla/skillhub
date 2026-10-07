import fs from 'fs';
import path from 'path';

export function validateSkill(dir: string): boolean {
  const skillMdPath = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    console.error(`❌ Validation failed: 'SKILL.md' not found in ${path.resolve(dir)}`);
    return false;
  }

  const content = fs.readFileSync(skillMdPath, 'utf-8');
  
  // Extract YAML frontmatter
  const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!match) {
    console.error(`❌ Validation failed: No YAML frontmatter found at the top of 'SKILL.md'.`);
    console.error(`   Please add a block like this:\n   ---\n   name: my-skill\n   description: A cool skill\n   ---`);
    return false;
  }

  const frontmatter = match[1];
  
  // Check for name
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  if (!nameMatch || !nameMatch[1].trim()) {
    console.error(`❌ Validation failed: 'name' is missing in the frontmatter.`);
    return false;
  }

  // Check for description
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
  if (!descMatch || !descMatch[1].trim()) {
    console.error(`❌ Validation failed: 'description' is missing in the frontmatter.`);
    return false;
  }

  console.log(`✅ Validation passed!`);
  console.log(`   Name: ${nameMatch[1].trim()}`);
  console.log(`   Description: ${descMatch[1].trim()}`);
  return true;
}
