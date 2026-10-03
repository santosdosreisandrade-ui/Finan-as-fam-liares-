const fs = require('fs');

let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

const calculateDatesCode = `
export const getCalculatedDate = (dateStr: string, addDays = 0, addYears = 0) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + addDays);
  date.setUTCFullYear(date.getUTCFullYear() + addYears);
  return date.toISOString().split('T')[0].split('-').reverse().join('/');
};
`;

content = content.replace(
  "import { CardsManager } from './CardsManager';",
  "import { CardsManager } from './CardsManager';\n" + calculateDatesCode
);

fs.writeFileSync('src/components/FamilyManager.tsx', content);

