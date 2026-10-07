import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { installSkill } from '../src/lib/installer.js';
import * as child_process from 'child_process';

vi.mock('child_process', () => {
  return {
    execSync: vi.fn()
  };
});

describe('Installer', () => {
  let tempDir: string;
  let originalCwd: () => string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillhub-test-inst-'));
    originalCwd = process.cwd;
    process.cwd = () => tempDir;
  });

  afterEach(() => {
    process.cwd = originalCwd;
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('should reject invalid URLs', async () => {
    await expect(installSkill('not-a-url', 'claude', false, true)).rejects.toThrow('Invalid GitHub URL');
  });

  it('should run install workflow successfully', async () => {
    const execSyncMock = vi.mocked(child_process.execSync);
    
    execSyncMock.mockImplementation((cmd: string, opts?: any) => {
      if (cmd.startsWith('git clone')) {
        const match = cmd.match(/"([^"]+)"$/);
        if (match) {
           const targetDir = match[1];
           fs.mkdirSync(targetDir, { recursive: true });
           fs.writeFileSync(path.join(targetDir, 'SKILL.md'), '---\nname: my-skill\ndescription: desc\n---');
        }
        return Buffer.from('');
      }
      if (cmd.startsWith('git rev-parse')) {
        return Buffer.from('mock-hash-12345\n');
      }
      return Buffer.from('');
    });

    await installSkill('https://github.com/foo/bar', 'claude', false, true);

    const lockPath = path.join(tempDir, '.claude/skills.lock.json');
    expect(fs.existsSync(lockPath)).toBe(true);
    
    const lockfileContent = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    expect(lockfileContent.skills['bar'].commitHash).toBe('mock-hash-12345');
  });
});
