const fs = require('fs');
let content = fs.readFileSync('src/components/TransactionList.tsx', 'utf8');

if (!content.includes("import { PersonName, parsePersonName } from './PersonName';")) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport { PersonName, parsePersonName } from './PersonName';");
}

fs.writeFileSync('src/components/TransactionList.tsx', content);
