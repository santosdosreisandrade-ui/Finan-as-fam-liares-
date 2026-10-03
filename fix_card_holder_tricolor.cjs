const fs = require('fs');
let content = fs.readFileSync('src/components/CardsManager.tsx', 'utf8');

const oldP = `<p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Titular: {card.holderName}</p>`;

const newP = `
                        {(() => {
                          const isFluminense = Object.values(people || {}).find(p => p.name === card.holderName)?.secretTheme === 'fluminense';
                          return isFluminense ? (
                            <p className="text-[10px] uppercase tracking-widest mt-1">
                              <span className="text-white/30">Titular: </span>
                              <span className="bg-gradient-to-r from-[#8A1538]/20 via-white/10 to-[#00572D]/20 border border-[#8A1538]/50 shadow-[0_0_10px_rgba(138,21,56,0.1)] px-1.5 py-[1px] rounded text-white font-bold ml-1">
                                {card.holderName}
                              </span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Titular: {card.holderName}</p>
                          );
                        })()}
`;

content = content.replace(oldP, newP);

fs.writeFileSync('src/components/CardsManager.tsx', content);
