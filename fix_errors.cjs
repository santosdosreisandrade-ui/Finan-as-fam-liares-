const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace("Shield } from 'lucide-react';", "Shield, Database } from 'lucide-react';");
fs.writeFileSync('src/App.tsx', content);

let serverContent = fs.readFileSync('server.ts', 'utf8');
serverContent = serverContent.replace("...docSnap.data(),\n          backupTimestamp: Date.now()", "...(docSnap.data() || {}),\n          backupTimestamp: Date.now()");
serverContent = serverContent.replace("...docSnap.data(),\n              backupTimestamp: Date.now()", "...(docSnap.data() || {}),\n              backupTimestamp: Date.now()");
fs.writeFileSync('server.ts', serverContent);
