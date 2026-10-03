const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

const oldPeopleList = "const peopleList = Object.values(people) as Person[];";
const newPeopleList = `const peopleList = (Object.values(people) as Person[]).sort((a, b) => {
    // Family on top
    if (a.role === 'family' && b.role !== 'family') return -1;
    if (a.role !== 'family' && b.role === 'family') return 1;
    // Fallback to order
    return (a.order || 0) - (b.order || 0);
  });`;

content = content.replace(oldPeopleList, newPeopleList);
fs.writeFileSync('src/components/FamilyManager.tsx', content);
