const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/status: \(isFirst \|\| isSecretAdmin\) \? 'authorized' : 'pending',/g, "status: 'authorized',");
content = content.replace("const isFirst = Object.keys(newDevices).length === 0;", ""); // we don't strictly need this line if it's not used, but let's check if it is used.

fs.writeFileSync('src/App.tsx', content);
