const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

if (!content.includes('PersonName')) {
  content = content.replace("import { Users, UserPlus, Heart, Briefcase, Plus, X, Trash2, GripVertical, Cat, Info, ShieldAlert } from 'lucide-react';", "import { Users, UserPlus, Heart, Briefcase, Plus, X, Trash2, GripVertical, Cat, Info, ShieldAlert } from 'lucide-react';\nimport { PersonName } from './PersonName';");
}

content = content.replace("{person.name}", "<PersonName rawName={person.name} />");
content = content.replace("{person.name}", "<PersonName rawName={person.name} />"); // replace twice as there are two matches (at 815 and 818, though maybe more, I will use regex)

content = content.replace(/\{person\.name\}/g, "<PersonName rawName={person.name} />");

fs.writeFileSync('src/components/FamilyManager.tsx', content);
