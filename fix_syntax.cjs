const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

content = content.replace(
  /\{editRole === 'pet' \? \(\s*<div className="flex gap-2 w-full mt-2">/g,
  "{editRole === 'pet' ? (\n                    <>\n                      <div className=\"flex gap-2 w-full mt-2\">"
);

content = content.replace(
  /<option value="réptil">Réptil<\/option>\s*<\/select>\s*\) : \(/g,
  "<option value=\"réptil\">Réptil</option>\n                      </select>\n                    </>\n                  ) : ("
);

fs.writeFileSync('src/components/FamilyManager.tsx', content);
