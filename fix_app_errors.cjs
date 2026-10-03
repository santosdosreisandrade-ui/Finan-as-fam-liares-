const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The issue is that applyDataChange was placed in the wrong functions.
// Let's replace ALL applyDataChange calls with setData(newData); setRemoteData(newData);
content = content.replace(/applyDataChange\(newData, '[^']+', '[^']+', [^;]+\);/g, 'setData(newData);\n    setRemoteData(newData);');

fs.writeFileSync('src/App.tsx', content);
