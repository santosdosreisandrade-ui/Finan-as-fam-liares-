const fs = require('fs');

let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

// Replace the handleAddMachine form
const oldForm = `<form onSubmit={handleAddMachine} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={vName} onChange={e => setVName(e.target.value)} placeholder="Apelido (ex: Carro da Maria)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={vBrand} onChange={e => setVBrand(e.target.value)} placeholder="Marca (ex: Honda)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={vModel} onChange={e => setVModel(e.target.value)} placeholder="Modelo (ex: Civic)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={vColor} onChange={e => setVColor(e.target.value)} placeholder="Cor" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={vPlate} onChange={e => setVPlate(e.target.value)} placeholder="Placa" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full uppercase" />
              <div className="flex gap-2 items-center w-full bg-[#050505] border border-white/10 p-3 text-sm focus-within:border-emerald-500/50">
                <input type="number" step="0.01" value={vIpva} onChange={e => setVIpva(e.target.value)} disabled={vIpvaExempt} placeholder={vIpvaExempt ? "Isento" : "Valor IPVA (R$)"} className="bg-transparent outline-none text-white w-full disabled:opacity-30" />
                <label className="flex items-center gap-2 text-white/50 text-xs whitespace-nowrap cursor-pointer">
                  <input type="checkbox" checked={vIpvaExempt} onChange={e => setVIpvaExempt(e.target.checked)} className="accent-emerald-500" /> Isento
                </label>
              </div>
              <input type="number" step="0.01" value={vLicensing} onChange={e => setVLicensing(e.target.value)} placeholder="Valor Licenciamento (R$)" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
            </div>
            <button type="submit" className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors">
              Salvar Máquina
            </button>
          </form>`;

const newForm = `<form onSubmit={handleAddMachine} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
            <select value={vCategory} onChange={e => setVCategory(e.target.value as any)} className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full md:w-1/2">
              <option value="vehicle">Veículos</option>
              <option value="appliance">Eletrodomésticos</option>
            </select>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={vName} onChange={e => setVName(e.target.value)} placeholder={vCategory === 'vehicle' ? "Apelido (ex: Carro da Maria)" : "Nome (ex: Geladeira)"} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={vBrand} onChange={e => setVBrand(e.target.value)} placeholder={vCategory === 'vehicle' ? "Marca (ex: Honda)" : "Marca (ex: Brastemp)"} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              
              {vCategory === 'vehicle' ? (
                <>
                  <input type="text" value={vModel} onChange={e => setVModel(e.target.value)} placeholder="Modelo (ex: Civic)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                  <input type="text" value={vColor} onChange={e => setVColor(e.target.value)} placeholder="Cor" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                  <input type="text" value={vPlate} onChange={e => setVPlate(e.target.value)} placeholder="Placa" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full uppercase" />
                  <div className="flex gap-2 items-center w-full bg-[#050505] border border-white/10 p-3 text-sm focus-within:border-emerald-500/50">
                    <input type="number" step="0.01" value={vIpva} onChange={e => setVIpva(e.target.value)} disabled={vIpvaExempt} placeholder={vIpvaExempt ? "Isento" : "Valor IPVA (R$)"} className="bg-transparent outline-none text-white w-full disabled:opacity-30" />
                    <label className="flex items-center gap-2 text-white/50 text-xs whitespace-nowrap cursor-pointer">
                      <input type="checkbox" checked={vIpvaExempt} onChange={e => setVIpvaExempt(e.target.checked)} className="accent-emerald-500" /> Isento
                    </label>
                  </div>
                  <input type="number" step="0.01" value={vLicensing} onChange={e => setVLicensing(e.target.value)} placeholder="Valor Licenciamento (R$)" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                </>
              ) : (
                <>
                  <DateInput value={vPurchaseDate} onChange={setVPurchaseDate} required placeholder="Data de Compra" containerClassName="w-full" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia da Loja</p>
                    <p className="text-sm text-white">90 dias após compra</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia de Fábrica</p>
                    <p className="text-sm text-white">1 ano</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full col-span-1 md:col-span-2">
                    <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer mb-2">
                      <input type="checkbox" checked={vExtendedWarranty} onChange={e => setVExtendedWarranty(e.target.checked)} className="accent-emerald-500" />
                      Garantia Estendida
                    </label>
                    {vExtendedWarranty && (
                      <select value={vExtendedWarrantyTime} onChange={e => setVExtendedWarrantyTime(e.target.value)} className="bg-transparent border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white w-full md:w-1/2">
                        <option value="">Selecione o tempo...</option>
                        <option value="12 meses">12 meses</option>
                        <option value="24 meses">24 meses</option>
                        <option value="36 meses">36 meses</option>
                      </select>
                    )}
                  </div>
                </>
              )}
            </div>
            <button type="submit" className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors">
              Salvar Máquina
            </button>
          </form>`;

content = content.replace(oldForm, newForm);
fs.writeFileSync('src/components/FamilyManager.tsx', content);
