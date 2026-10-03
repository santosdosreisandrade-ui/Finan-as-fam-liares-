const fs = require('fs');
const content = fs.readFileSync('src/components/TransactionList.tsx', 'utf8');

const importStatement = "import { getPetContainerClasses, getPetBackgroundStyle } from '../lib/petUtils';\n";

let newContent = content;
if (!newContent.includes('getPetContainerClasses')) {
  newContent = newContent.replace("import { CategoryIcon } from './CategoryIcon';", "import { CategoryIcon } from './CategoryIcon';\n" + importStatement);
}

newContent = newContent.replace(
  "const renderTransaction = (tx: Transaction) => (",
  `const renderTransaction = (tx: Transaction) => {
    const isPet = tx.paidBy && people[tx.paidBy]?.role === 'pet';
    const petSpecies = isPet ? people[tx.paidBy]?.species : '';
    let containerClass = \`flex items-center justify-between p-4 border-l-2 \${tx.type === 'income' ? 'border-emerald-500' : 'border-rose-500'} group hover:bg-white/[0.05] transition-all \${tx.status === 'pending' ? 'opacity-60' : ''}\`;
    
    let style = {};
    if (isPet) {
      containerClass += ' ' + getPetContainerClasses(petSpecies).replace('bg-orange-500/10', 'bg-orange-500/5').replace('bg-blue-500/10', 'bg-blue-500/5').replace('bg-cyan-500/10', 'bg-cyan-500/5').replace('bg-amber-500/10', 'bg-amber-500/5').replace('bg-sky-500/10', 'bg-sky-500/5').replace('bg-pink-500/10', 'bg-pink-500/5').replace('bg-emerald-800/20', 'bg-emerald-800/10').replace('bg-zinc-500/10', 'bg-zinc-500/5');
      style = getPetBackgroundStyle(petSpecies);
    } else {
      containerClass += ' bg-white/[0.02]';
    }

    return (
`
);

// We need to replace the opening <div key={tx.id} className={...}>
newContent = newContent.replace(
  /<div key=\{tx\.id\} className=\{`flex items-center justify-between p-4 bg-white\/\[0\.02\] border-l-2 \$\{tx\.type === 'income' \? 'border-emerald-500' : 'border-rose-500'\} group hover:bg-white\/\[0\.05\] transition-all \$\{tx\.status === 'pending' \? 'opacity-60' : ''\}`\}>/,
  `<div key={tx.id} className={containerClass} style={style}>`
);

newContent = newContent.replace(
  /<\/div>\n\s*\);\n\s*const hasPastAndPresent/,
  `    </div>
    );
  };
  const hasPastAndPresent`
);

fs.writeFileSync('src/components/TransactionList.tsx', newContent);
