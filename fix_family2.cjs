const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

content = content.replace(
  /import \{ CardsManager \} from '\.\/CardsManager';/,
  "import { CardsManager } from './CardsManager';\nimport { getPetContainerClasses, getPetBackgroundStyle, PetIcon } from '../lib/petUtils';"
);

content = content.replace(/let tagText = "";/g, 'let tagText: React.ReactNode = "";');

fs.writeFileSync('src/components/FamilyManager.tsx', content);
