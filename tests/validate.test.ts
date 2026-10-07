import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { validateSkill } from '../src/lib/validator.js';

describe('Validator', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillhub-test-val-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should fail if SKILL.md does not exist', () => {
    expect(validateSkill(tempDir)).toBe(false);
  });

  it('should fail if frontmatter is missing', () => {
    fs.writeFileSync(path.join(tempDir, 'SKILL.md'), '# No frontmatter');
    expect(validateSkill(tempDir)).toBe(false);
  });

  it('should fail if name or description is missing', () => {
    fs.writeFileSync(path.join(tempDir, 'SKILL.md'), '---\nname: foo\n---\n# Missing desc');
    expect(validateSkill(tempDir)).toBe(false);
  });

  it('should pass if valid frontmatter exists', () => {
    fs.writeFileSync(path.join(tempDir, 'SKILL.md'), '---\nname: foo\ndescription: bar\n---\n# Valid');
    expect(validateSkill(tempDir)).toBe(true);
  });
});
