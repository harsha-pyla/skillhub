import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getLockfilePath, readLockfile, writeLockfile, LockfileData } from '../src/lib/lockfile.js';

describe('Lockfile', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillhub-test-lock-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should generate correct lockfile path', () => {
    const basePath = path.join(tempDir, 'skills');
    const expected = path.join(tempDir, 'skills.lock.json');
    expect(getLockfilePath(basePath)).toBe(expected);
  });

  it('should read empty lockfile if it does not exist', () => {
    const lockPath = path.join(tempDir, 'skills.lock.json');
    const data = readLockfile(lockPath);
    expect(data.skills).toEqual({});
  });

  it('should write and read lockfile correctly', () => {
    const lockPath = path.join(tempDir, 'skills.lock.json');
    const testData: LockfileData = {
      skills: {
        'test-skill': {
          name: 'test-skill',
          sourceUrl: 'https://github.com/foo/bar',
          commitHash: '12345',
          installedDate: '2026-01-01'
        }
      }
    };
    writeLockfile(lockPath, testData);
    
    const data = readLockfile(lockPath);
    expect(data.skills['test-skill'].commitHash).toBe('12345');
  });
});
