const fs = require('fs');
let content = fs.readFileSync('src/components/TransactionList.tsx', 'utf8');

const regex = /\{\s*\) : \(\s*<span>\{tx\.paidBy\}<\/span>\s*\)\}/;
content = content.replace(regex, `            ) : (
                <span>{tx.paidBy}</span>
              )}`);

fs.writeFileSync('src/components/TransactionList.tsx', content);
