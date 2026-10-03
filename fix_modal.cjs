const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

const regex = /\) : \([\s\S]*?authorized\.map\(device => \([\s\S]*?\}\)[\s\S]*?\)\)[\s\S]*?\)\}/;
content = content.replace(regex, "");

fs.writeFileSync('src/components/DevicesModal.tsx', content);
