const fs = require('fs');
const s = fs.readFileSync('d:/Best_Site/frontend/src/pages/Planner.tsx','utf8');
const lines = s.split('\n');
let bal=0;for(let i=0;i<lines.length;i++){const line=lines[i];const opens=(line.match(/<div(\s|>)/g)||[]).length;const closes=(line.match(/<\/div>/g)||[]).length;bal+=opens-closes;if(opens||closes) console.log(i+1,'opens',opens,'closes',closes,'bal',bal,'->',line.trim().slice(0,120));}console.log('final bal',bal);
