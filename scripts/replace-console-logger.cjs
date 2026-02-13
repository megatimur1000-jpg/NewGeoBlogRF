const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'backend', 'src');

function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      walk(full);
    } else if (f.isFile() && full.endsWith('.js')) {
      processFile(full);
    }
  }
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  if (!/console\./.test(src)) return; // nothing to do

  const original = src;

  // Replace console.* with logger.* preserving spacing
  src = src.replace(/console\.error\s*\(/g, 'logger.error(');
  src = src.replace(/console\.warn\s*\(/g, 'logger.warn(');
  src = src.replace(/console\.log\s*\(/g, 'logger.info(');

  // Add logger import if missing and logger was used
  if (/logger\./.test(src) && !/import\s+logger\s+from\s+['"]\.\.\/\.\.\/logger\.js['"];?/.test(src)) {
    // Insert after the last import
    const importLine = "import logger from '../../logger.js';\n";
    const lines = src.split('\n');
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^import\s+/.test(lines[i])) insertAt = i + 1;
    }
    lines.splice(insertAt, 0, importLine);
    src = lines.join('\n');
  }

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log('Patched:', filePath);
  }
}

walk(ROOT);
console.log('Done.');
