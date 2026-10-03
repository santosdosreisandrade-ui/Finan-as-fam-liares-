const fs = require('fs');
let content = fs.readFileSync('src/components/CardsManager.tsx', 'utf8');

// Replace the <div key={card.id} className={\`p-4 flex flex-col gap-2 relative group border \${getBankStyle(card.bank)}\`}>

const search = '            <div key={card.id} className={`p-4 flex flex-col gap-2 relative group border ${getBankStyle(card.bank)}`}>';

const replace = `            <div key={card.id} className={\`p-4 flex flex-col gap-2 relative group border \${
              Object.values(people || {}).find(p => p.name === card.holderName)?.secretTheme === 'fluminense' 
                ? 'bg-gradient-to-r from-[#8A1538]/10 via-white/5 to-[#00572D]/10 border-[#8A1538]/50 shadow-[0_0_15px_rgba(138,21,56,0.1)]' 
                : getBankStyle(card.bank)
            }\`}>`;

content = content.replace(search, replace);

fs.writeFileSync('src/components/CardsManager.tsx', content);
