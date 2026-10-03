const fs = require('fs');

let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

const oldHeader = `<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Vault className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{saving.name || saving.bank} <span className="text-white/40 text-[10px]">({saving.bank})</span> {saving.type === 'stock' && <span className="text-[10px] ml-2 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">Ação</span>}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">
                      {saving.type === 'stock' ? 'Renda Variável' : \`\${saving.interestRate}% \${saving.interestPeriod === 'annual' ? 'a.a.' : 'a.m.'}\`}
                    </p>
                  </div>`;

const newHeader = `<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    {saving.applicationType === 'porquinho' ? <PiggyBank className="w-4 h-4 text-white/60" /> : <Vault className="w-4 h-4 text-white/60" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      {saving.name || saving.bank} <span className="text-white/40 text-[10px]">({saving.bank})</span> 
                      {saving.type === 'stock' && <span className="text-[10px] ml-2 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">Ação</span>}
                      {saving.applicationType === 'porquinho' && <span className="text-[10px] ml-2 text-fuchsia-400 border border-fuchsia-500/30 px-1.5 py-0.5 rounded">Porquinho</span>}
                      {saving.applicationType === 'tesouro' && <span className="text-[10px] ml-2 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">Tesouro Direto</span>}
                    </h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">
                      {saving.type === 'stock' ? 'Renda Variável' : (saving.applicationType === 'porquinho' ? 'Sem Rendimento Automático' : \`\${saving.interestRate}% \${saving.interestPeriod === 'annual' ? 'a.a.' : 'a.m.'}\`)}
                    </p>
                  </div>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/SavingsManager.tsx', content);

