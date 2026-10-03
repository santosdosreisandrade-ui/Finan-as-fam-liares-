const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

const oldEditRole = `                    {editRole === 'pet' ? (
                    <>
                      <div className="flex gap-2 w-full mt-2">
                      <DateInput value={editAdoptionDate} onChange={setEditAdoptionDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Data de Adoção"  />
                      <DateInput value={editBirthDate} onChange={setEditBirthDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Nascimento"  />
                    </div>`;

const newEditRole = `                    {editRole === 'pet' ? (
                    <>
                      <div className="flex gap-2 w-full mt-2">
                        <DateInput value={editAdoptionDate} onChange={setEditAdoptionDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Data de Adoção"  />
                        <DateInput value={editBirthDate} onChange={setEditBirthDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Nascimento"  />
                      </div>`;

const newReplacement = `                    <div className="flex gap-2 w-full mt-2">
                      {editRole === 'pet' && (
                        <DateInput value={editAdoptionDate} onChange={setEditAdoptionDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Data de Adoção"  />
                      )}
                      <DateInput value={editBirthDate} onChange={setEditBirthDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Nascimento"  />
                    </div>
                    {editRole === 'pet' ? (
                    <>`;

content = content.replace(oldEditRole, newReplacement);
fs.writeFileSync('src/components/FamilyManager.tsx', content);
