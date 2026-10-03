const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

const oldDates = `            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Data de Adoção</label>
                <DateInput value={adoptionDate} onChange={setAdoptionDate} containerClassName="w-full"  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full [color-scheme:dark]"  />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Data de Nascimento</label>
                <DateInput value={birthDate} onChange={setBirthDate} containerClassName="w-full"  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full [color-scheme:dark]"  />
              </div>
            </div>`;

const newDates = `            <div className="flex flex-col gap-4 md:flex-row">
              {role === 'pet' && (
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Data de Adoção</label>
                  <DateInput value={adoptionDate} onChange={setAdoptionDate} containerClassName="w-full"  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full [color-scheme:dark]"  />
                </div>
              )}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Data de Nascimento</label>
                <DateInput value={birthDate} onChange={setBirthDate} containerClassName="w-full"  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full [color-scheme:dark]"  />
              </div>
            </div>`;

content = content.replace(oldDates, newDates);
fs.writeFileSync('src/components/FamilyManager.tsx', content);
