const fs = require('fs');
let content = fs.readFileSync('src/components/TransactionList.tsx', 'utf8');

content = content.replace("{people[tx.paidBy].secretTheme === 'fluminense' ? (", "people[tx.paidBy].secretTheme === 'fluminense' ? (");

fs.writeFileSync('src/components/TransactionList.tsx', content);
