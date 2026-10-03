const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  "type?: 'savings' | 'stock';",
  "type?: 'savings' | 'stock';\n  applicationType?: 'porquinho' | 'tesouro' | 'outras';\n  notifyUpdate?: boolean;"
);
fs.writeFileSync('src/types.ts', content);
