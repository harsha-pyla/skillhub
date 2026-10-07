import fs from 'fs';
import path from 'path';

export interface LockfileEntry {
  name: string;
  sourceUrl: string;
  commitHash: string;
  installedDate: string;
}

export interface LockfileData {
  skills: Record<string, LockfileEntry>;
}

export function getLockfilePath(basePath: string): string {
  // Place the lockfile as a sibling to the skills directory (e.g., .claude/skills.lock.json)
  return path.join(path.dirname(basePath), 'skills.lock.json');
}

export function readLockfile(lockfilePath: string): LockfileData {
  if (fs.existsSync(lockfilePath)) {
    try {
      const content = fs.readFileSync(lockfilePath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.warn(`Warning: Could not parse lockfile at ${lockfilePath}. Creating a new one.`);
    }
  }
  return { skills: {} };
}

export function writeLockfile(lockfilePath: string, data: LockfileData): void {
  const dir = path.dirname(lockfilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(lockfilePath, JSON.stringify(data, null, 2), 'utf-8');
}
