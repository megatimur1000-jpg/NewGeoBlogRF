const fs = require('fs');
const s = fs.readFileSync('d:/Best_Site/frontend/src/pages/Planner.tsx', 'utf8');
let bal = 0;
let inSingle = false, inDouble = false, inBack = false, inLine = false, inBlock = false;
const lines = s.split('\n');
for (let li = 0; li < lines.length; li++) {
  const line = lines[li];
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = i > 0 ? line[i-1] : '';
    if (inLine) continue;
    if (inBlock) {
      if (ch === '*' && line[i+1] === '/') { inBlock = false; i++; }
      continue;
    }
    if (!inSingle && !inDouble && !inBack) {
      if (ch === '/' && line[i+1] === '/') { inLine = true; break; }
      if (ch === '/' && line[i+1] === '*') { inBlock = true; i++; continue; }
    }
    if (!inLine && !inBlock) {
      if (ch === '"' && !inSingle && !inBack && prev !== '\\') { inDouble = !inDouble; continue; }
      if (ch === '\'' && !inDouble && !inBack && prev !== '\\') { inSingle = !inSingle; continue; }
      if (ch === '`' && !inSingle && !inDouble && prev !== '\\') { inBack = !inBack; continue; }
    }
    // Only count parentheses when not inside any string/comment
    if (!inSingle && !inDouble && !inBack && !inLine && !inBlock) {
      if (ch === '(') bal++;
      if (ch === ')') bal--;
      if (bal < 0) {
        console.log('Negative at line', li+1, 'col', i+1);
        console.log('Context prev:', lines[li-1] || '<BOF>');
        console.log('Line:', line);
        process.exit(0);
      }
    }
  }
  inLine = false;
}
console.log('Final balance', bal);
