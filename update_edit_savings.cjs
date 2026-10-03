const fs = require('fs');

let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

const editFormOld = `<div className="flex gap-2">
                    <input type="number" step="0.01" value={editInitialAmount} onChange={e => setEditInitialAmount(e.target.value)} placeholder="Aplicado (R$)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                    <input type="number" step="0.01" value={editInterestRate} onChange={e => setEditInterestRate(e.target.value)} placeholder="Juros (%)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-24" />
                    <select value={editInterestPeriod} onChange={e => setEditInterestPeriod(e.target.value as 'monthly' | 'annual')} className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-20">
                      <option value="annual">a.a.</option>
                      <option value="monthly">a.m.</option>
                    </select>
                  </div>`;

const editFormNew = `<div className="flex gap-2">
                    <select value={editApplicationType} onChange={e => setEditApplicationType(e.target.value as any)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-32">
                      <option value="porquinho">Porquinho</option>
                      <option value="tesouro">Tesouro</option>
                      <option value="outras">Outras</option>
                    </select>
                    <input type="number" step="0.01" value={editInitialAmount} onChange={e => setEditInitialAmount(e.target.value)} placeholder="Aplicado (R$)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                  </div>
                  {editApplicationType === 'porquinho' ? (
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer p-2">
                        <input type="checkbox" checked={editNotifyUpdate} onChange={e => setEditNotifyUpdate(e.target.checked)} className="accent-emerald-500" /> 
                        Notificar atualização de saldo mensalmente
                      </label>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="number" step="0.01" value={editInterestRate} onChange={e => setEditInterestRate(e.target.value)} placeholder="Juros (%)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                      <select value={editInterestPeriod} onChange={e => setEditInterestPeriod(e.target.value as 'monthly' | 'annual')} className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-20">
                        <option value="annual">a.a.</option>
                        <option value="monthly">a.m.</option>
                      </select>
                    </div>
                  )}`;

content = content.replace(editFormOld, editFormNew);
fs.writeFileSync('src/components/SavingsManager.tsx', content);
