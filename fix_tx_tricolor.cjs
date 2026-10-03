const fs = require('fs');
let content = fs.readFileSync('src/components/TransactionList.tsx', 'utf8');

const oldSpan = `<span className="px-1.5 py-[1px] rounded border border-current text-[9px] uppercase tracking-widest font-bold" style={{ color: parsePersonName(people[tx.paidBy].name).color || '#888' }}>
                  <PersonName rawName={people[tx.paidBy].name} />
                </span>`;

const newSpan = `{people[tx.paidBy].secretTheme === 'fluminense' ? (
                <span className="bg-gradient-to-r from-[#8A1538]/20 via-white/10 to-[#00572D]/20 border border-[#8A1538]/50 shadow-[0_0_10px_rgba(138,21,56,0.1)] px-1.5 py-[1px] rounded text-[9px] uppercase tracking-widest font-bold text-white">
                  <PersonName rawName={people[tx.paidBy].name} />
                </span>
              ) : (
                <span className="px-1.5 py-[1px] rounded border border-current text-[9px] uppercase tracking-widest font-bold" style={{ color: parsePersonName(people[tx.paidBy].name).color || '#888' }}>
                  <PersonName rawName={people[tx.paidBy].name} />
                </span>
              )}`;

content = content.replace(oldSpan, newSpan);

fs.writeFileSync('src/components/TransactionList.tsx', content);
