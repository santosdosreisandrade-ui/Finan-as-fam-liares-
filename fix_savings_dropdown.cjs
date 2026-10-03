const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

const oldDropdown = '<select value={editType} onChange={e => setEditType(e.target.value as any)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-32"><option value="savings">Renda Fixa</option><option value="stock">Ações</option></select>';
const newDropdown = ''; // we can just remove it, wait, if we remove it, we also need to remove the gap or just remove the select entirely

content = content.replace(oldDropdown, newDropdown);
fs.writeFileSync('src/components/SavingsManager.tsx', content);
