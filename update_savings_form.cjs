const fs = require('fs');

let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

const addFormOld = `<div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Taxa de Juros (%)</label>
              <div className="flex">
                <input type="text" inputMode="decimal" value={interestRate} onChange={e => setInterestRate(e.target.value.replace(/[^0-9.,]/g, ''))} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" placeholder="ex: 10.5" />
                <select value={interestPeriod} onChange={e => setInterestPeriod(e.target.value as 'monthly' | 'annual')} className="bg-[#050505] border-y border-r border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                  <option value="annual">a.a.</option>
                  <option value="monthly">a.m.</option>
                </select>
              </div>
            </div>`;

const addFormNew = `<div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tipo de Aplicação</label>
              <select value={applicationType} onChange={e => setApplicationType(e.target.value as any)} className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full">
                <option value="porquinho">Porquinho</option>
                <option value="tesouro">Tesouro Direto</option>
                <option value="outras">Outras</option>
              </select>
            </div>
            
            {applicationType === 'porquinho' ? (
              <div className="flex flex-col gap-1 justify-center h-full pt-4">
                <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
                  <input type="checkbox" checked={notifyUpdate} onChange={e => setNotifyUpdate(e.target.checked)} className="accent-emerald-500" /> 
                  Notificar para atualizar saldo mensalmente
                </label>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Taxa de Juros (%)</label>
                <div className="flex">
                  <input type="text" inputMode="decimal" value={interestRate} onChange={e => setInterestRate(e.target.value.replace(/[^0-9.,]/g, ''))} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" placeholder="ex: 10.5" />
                  <select value={interestPeriod} onChange={e => setInterestPeriod(e.target.value as 'monthly' | 'annual')} className="bg-[#050505] border-y border-r border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                    <option value="annual">a.a.</option>
                    <option value="monthly">a.m.</option>
                  </select>
                </div>
              </div>
            )}`;

content = content.replace(addFormOld, addFormNew);

fs.writeFileSync('src/components/SavingsManager.tsx', content);
