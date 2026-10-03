const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const effectOld = /if \(userName && !currentDevice && data\.transactions\) \{/g;
const effectNew = `if (userName && !currentDevice && data.categories) {`;

content = content.replace(effectOld, effectNew);
fs.writeFileSync('src/App.tsx', content);
