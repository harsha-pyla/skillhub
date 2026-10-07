import fs from 'fs';
import path from 'path';

export interface ScanResult {
  warnings: string[];
}

const DANGEROUS_COMMANDS = [
  /rm\s+-rf/i,
  /(curl|wget)\s+.*?\|\s*(bash|sh)/i
];

const SECRET_PATTERNS = [
  /sk_[a-zA-Z0-9_]{20,}/, // Typical secret keys like Stripe/OpenAI
  /AKIA[0-9A-Z]{16}/,    // AWS Access Key
  /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9\-_]+['"]/i, // Generic API key assignment
  /password\s*[:=]\s*['"][a-zA-Z0-9\-_]+['"]/i
];

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

export function scanDirectory(dir: string): ScanResult {
  const warnings: string[] = [];
  
  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git') continue;
      
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        if (stats.size > MAX_FILE_SIZE) {
          warnings.push(`File too large: ${entry.name} (${Math.round(stats.size / 1024)} KB)`);
          continue; 
        }
        
        const ext = path.extname(entry.name).toLowerCase();
        const unexpectedExts = ['.exe', '.dll', '.so', '.dylib', '.bin'];
        if (unexpectedExts.includes(ext)) {
          warnings.push(`Unexpected binary file: ${entry.name}`);
        }
        
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          for (const pattern of DANGEROUS_COMMANDS) {
            if (pattern.test(content)) {
              warnings.push(`Dangerous shell command found in ${entry.name}`);
            }
          }
          
          for (const pattern of SECRET_PATTERNS) {
            if (pattern.test(content)) {
              warnings.push(`Possible secret/API key found in ${entry.name}`);
            }
          }
        } catch (e) {
          // ignore encoding issues for binary files
        }
      }
    }
  }
  
  walk(dir);
  return { warnings };
}
