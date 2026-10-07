import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { agentPaths, AgentType } from './agents.js';
import { getLockfilePath, readLockfile, writeLockfile } from './lockfile.js';
import { scanDirectory } from './scanner.js';

function askUser(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

export async function installSkill(url: string, agent: AgentType, isGlobal: boolean, skipPrompt: boolean = false) {
  let tempDir = '';
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+\/(.+))?/);
    if (!match) {
      throw new Error('Invalid GitHub URL. Must be a github.com URL.');
    }
    
    const [, owner, repo, subfolder] = match;
    const skillName = subfolder ? path.basename(subfolder) : repo;
    
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillhub-'));
    
    console.log(`Downloading ${owner}/${repo}...`);
    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    execSync(`git clone --depth 1 ${cloneUrl} "${tempDir}"`, { stdio: 'ignore' });
    
    const sourcePath = subfolder ? path.join(tempDir, subfolder) : tempDir;
    
    const skillMdPath = path.join(sourcePath, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      throw new Error(`SKILL.md not found in ${url}`);
    }

    // Security scan
    const scan = scanDirectory(sourcePath);
    if (scan.warnings.length > 0) {
      console.warn('\n⚠️  SECURITY WARNINGS:');
      scan.warnings.forEach(w => console.warn(`   - ${w}`));
      
      if (!skipPrompt) {
        const proceed = await askUser('\nInstall anyway? (y/n) ');
        if (!proceed) {
          console.log('Installation aborted.');
          return;
        }
      } else {
        console.log('\nProceeding with installation (--yes flag provided).');
      }
    }
    
    const basePath = isGlobal ? agentPaths[agent].global : path.join(process.cwd(), agentPaths[agent].local);
    const destDir = path.join(basePath, skillName);
    
    if (fs.existsSync(destDir)) {
      console.log(`Skill '${skillName}' already exists. Overwriting...`);
      fs.rmSync(destDir, { recursive: true, force: true });
    }
    fs.mkdirSync(destDir, { recursive: true });
    
    fs.cpSync(sourcePath, destDir, { recursive: true });
    
    const commitHash = execSync('git rev-parse HEAD', { cwd: tempDir }).toString().trim();
    
    const lockfilePath = getLockfilePath(basePath);
    const lockfileData = readLockfile(lockfilePath);
    lockfileData.skills[skillName] = {
      name: skillName,
      sourceUrl: url,
      commitHash,
      installedDate: new Date().toISOString()
    };
    writeLockfile(lockfilePath, lockfileData);

    console.log(`Success! Skill '${skillName}' installed at ${destDir}`);
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
