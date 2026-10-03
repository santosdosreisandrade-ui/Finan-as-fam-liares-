const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace("...(docSnap.data() || {}),", "...((docSnap.data() || {}) as object),");
content = content.replace("...(docSnap.data() || {}),", "...((docSnap.data() || {}) as object),");

fs.writeFileSync('server.ts', content);
