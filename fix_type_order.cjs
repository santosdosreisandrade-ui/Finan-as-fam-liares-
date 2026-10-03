const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  "secretTheme?: 'fluminense';",
  "secretTheme?: 'fluminense';\n  order?: number;"
);
fs.writeFileSync('src/types.ts', content);
