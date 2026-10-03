const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

// Fix startEdit
content = content.replace(
  /setEditName\(saving\.name \|\| ''\);\n\s*setEditName\(saving\.name \|\| ''\);/g,
  "setEditName(saving.name || '');"
);

// Fix saveEdit
content = content.replace(
  /name: editName,\n\s*name: editName,/g,
  "name: editName,"
);

// Fix newSaving
content = content.replace(
  /id: uuidv4\(\),\n\s*bank,/g,
  "id: uuidv4(),\n      name,\n      bank,"
);

fs.writeFileSync('src/components/SavingsManager.tsx', content);
