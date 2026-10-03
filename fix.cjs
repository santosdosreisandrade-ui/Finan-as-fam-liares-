const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

content = content.replace(
  /\{\s*Object\.values\(vehicles\)\.map\(\(v: any\) => \(\s*\{\(\(\) => \{/,
  `{Object.values(vehicles).map((v: any) => {`
);

content = content.replace(
  /          \);\n          \}\)\(\)\}\n          \)\)\}/,
  `          );\n          })}`
);

fs.writeFileSync('src/components/FamilyManager.tsx', content);
