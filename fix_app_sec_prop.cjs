const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("<SecuritySettingsModal onClose={() => setShowSecurity(false)} />", "<SecuritySettingsModal onClose={() => setShowSecurity(false)} logs={data.logs || {}} />");

fs.writeFileSync('src/App.tsx', content);
