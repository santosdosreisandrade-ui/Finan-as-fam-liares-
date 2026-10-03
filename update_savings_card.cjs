const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

// Replace standard card color
content = content.replace(
  `className="p-6 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-4 group"`,
  `className={\`p-6 \${getBankColor(saving.bank)} transition-colors flex flex-col gap-4 group\`}`
);

// We should also adjust the grid for "Seguradora / Banco"
const addFormGridOld = `<div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Banco / Corretora</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white mb-4" placeholder="Nome da Reserva (ex: Viagem)" />
              <input type="text" value={bank} onChange={e => setBank(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" placeholder="ex: Nubank, Tesouro Direto" />
            </div>`;
const addFormGridNew = `<div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nome da Reserva</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" placeholder="ex: Viagem" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Seguradora / Banco</label>
              <input type="text" value={bank} onChange={e => setBank(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" placeholder="ex: Nubank, Inter" />
            </div>`;
content = content.replace(addFormGridOld, addFormGridNew);

// Adjust edit form grid too if it exists and looks crowded.
const editFormBankOld = `<input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white mb-4" placeholder="Nome da Reserva (ex: Viagem)" />
                            <input type="text" value={editBank} onChange={e => setEditBank(e.target.value)} placeholder="Banco/Corretora" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />`;
const editFormBankNew = `<div className="flex flex-col gap-2 flex-1">
  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white w-full" placeholder="Nome" />
  <input type="text" value={editBank} onChange={e => setEditBank(e.target.value)} placeholder="Seguradora/Banco" className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-full" />
</div>`;
content = content.replace(editFormBankOld, editFormBankNew);

fs.writeFileSync('src/components/SavingsManager.tsx', content);

