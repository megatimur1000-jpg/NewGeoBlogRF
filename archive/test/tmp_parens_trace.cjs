const fs = require('fs');
const s = fs.readFileSync('d:/Best_Site/frontend/src/pages/Planner.tsx', 'utf8');
const lines = s.split('\n');
let bal = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === '(') bal++;
    if (ch === ')') bal--;
  }
  if (i >= 960 && i <= 1000) {
    console.log(i+1, 'bal=', bal, '->', line.trim());
  }
}
console.log('final bal', bal);
