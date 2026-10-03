const fs = require('fs');

let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

const editFormOld = `<div className="flex flex-col gap-3">
    <input type="text" value={editVName} onChange={e => setEditVName(e.target.value)} placeholder="Apelido" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editVBrand} onChange={e => setEditVBrand(e.target.value)} placeholder="Marca" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editVModel} onChange={e => setEditVModel(e.target.value)} placeholder="Modelo" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editVColor} onChange={e => setEditVColor(e.target.value)} placeholder="Cor" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editVPlate} onChange={e => setEditVPlate(e.target.value)} placeholder="Placa" className="bg-[#050505] border border-white/10 p-2 text-sm text-white uppercase" />
    <div className="flex gap-2">
      <div className="flex gap-2 items-center bg-[#050505] border border-white/10 p-2 text-sm flex-1 focus-within:border-emerald-500/50">
        <input type="text" inputMode="decimal" value={editVIpva} onChange={e => setEditVIpva(e.target.value.replace(/[^0-9.,]/g, ''))} disabled={editVIpvaExempt} placeholder={editVIpvaExempt ? "Isento" : "IPVA"} className="bg-transparent outline-none text-white w-full disabled:opacity-30" />
        <label className="flex items-center gap-1 text-white/50 text-[10px] whitespace-nowrap cursor-pointer">
          <input type="checkbox" checked={editVIpvaExempt} onChange={e => setEditVIpvaExempt(e.target.checked)} className="accent-emerald-500" /> Isento
        </label>
      </div>
      <input type="text" inputMode="decimal" value={editVLicensing} onChange={e => setEditVLicensing(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="Licenciamento" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
    </div>
    <div className="flex gap-2">
      <button onClick={() => saveEditMachine(v)} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex justify-center"><Check className="w-4 h-4" /></button>
      <button onClick={() => setEditingMachineId(null)} className="flex-1 p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex justify-center"><X className="w-4 h-4" /></button>
    </div>
  </div>`;

const editFormNew = `<div className="flex flex-col gap-3">
    <select value={editVCategory} onChange={e => setEditVCategory(e.target.value as any)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white">
      <option value="vehicle">Veículos</option>
      <option value="appliance">Eletrodomésticos</option>
    </select>
    <input type="text" value={editVName} onChange={e => setEditVName(e.target.value)} placeholder={editVCategory === 'vehicle' ? "Apelido" : "Nome"} className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editVBrand} onChange={e => setEditVBrand(e.target.value)} placeholder="Marca" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    
    {editVCategory === 'vehicle' ? (
      <>
        <input type="text" value={editVModel} onChange={e => setEditVModel(e.target.value)} placeholder="Modelo" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
        <input type="text" value={editVColor} onChange={e => setEditVColor(e.target.value)} placeholder="Cor" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
        <input type="text" value={editVPlate} onChange={e => setEditVPlate(e.target.value)} placeholder="Placa" className="bg-[#050505] border border-white/10 p-2 text-sm text-white uppercase" />
        <div className="flex gap-2">
          <div className="flex gap-2 items-center bg-[#050505] border border-white/10 p-2 text-sm flex-1 focus-within:border-emerald-500/50">
            <input type="text" inputMode="decimal" value={editVIpva} onChange={e => setEditVIpva(e.target.value.replace(/[^0-9.,]/g, ''))} disabled={editVIpvaExempt} placeholder={editVIpvaExempt ? "Isento" : "IPVA"} className="bg-transparent outline-none text-white w-full disabled:opacity-30" />
            <label className="flex items-center gap-1 text-white/50 text-[10px] whitespace-nowrap cursor-pointer">
              <input type="checkbox" checked={editVIpvaExempt} onChange={e => setEditVIpvaExempt(e.target.checked)} className="accent-emerald-500" /> Isento
            </label>
          </div>
          <input type="text" inputMode="decimal" value={editVLicensing} onChange={e => setEditVLicensing(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="Licenciamento" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
        </div>
      </>
    ) : (
      <>
        <DateInput value={editVPurchaseDate} onChange={setEditVPurchaseDate} placeholder="Data de Compra" containerClassName="w-full" className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-full" />
        <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
          <input type="checkbox" checked={editVExtendedWarranty} onChange={e => setEditVExtendedWarranty(e.target.checked)} className="accent-emerald-500" /> Garantia Estendida
        </label>
        {editVExtendedWarranty && (
          <select value={editVExtendedWarrantyTime} onChange={e => setEditVExtendedWarrantyTime(e.target.value)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white">
            <option value="">Selecione o tempo...</option>
            <option value="12 meses">12 meses</option>
            <option value="24 meses">24 meses</option>
            <option value="36 meses">36 meses</option>
          </select>
        )}
      </>
    )}
    
    <div className="flex gap-2 mt-2">
      <button onClick={() => saveEditMachine(v)} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex justify-center"><Check className="w-4 h-4" /></button>
      <button onClick={() => setEditingMachineId(null)} className="flex-1 p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex justify-center"><X className="w-4 h-4" /></button>
    </div>
  </div>`;

content = content.replace(editFormOld, editFormNew);

// Replace the info rendering
const infoOld = `<div className={infoContainerClasses}>
                <p>Marca: <span className={spanClasses}>{v.brand}</span></p>
                <p>Modelo: <span className={spanClasses}>{v.model}</span></p>
                <p>Cor: <span className={spanClasses}>{v.color}</span></p>
                <p>Placa: <span className={spanClasses}>{v.plate}</span></p>
                {v.machineType && <p>Tipo: <span className={spanClasses}>{v.machineType}</span></p>}
                {v.purchaseDate && <p>Compra: <span className={spanClasses}>{v.purchaseDate.split('-').reverse().join('/')}</span></p>}
                {v.warranty && <p>Garantia: <span className={spanClasses}>{v.warranty}</span></p>}
                <div className="mt-4 pt-4 border-t border-white/10 text-xs flex justify-between text-white/50">
                  <span>IPVA: {v.ipvaExempt ? 'Isento' : (v.ipvaValue ? formatCurrency(v.ipvaValue) : 'Não informado')}</span>
                  <span>LIC: {v.licensingValue ? formatCurrency(v.licensingValue) : 'Não informado'}</span>
                </div>
              </div>`;

const infoNew = `<div className={infoContainerClasses}>
                <p>Marca: <span className={spanClasses}>{v.brand}</span></p>
                
                {v.category === 'appliance' ? (
                  <>
                    {v.purchaseDate && <p>Compra: <span className={spanClasses}>{v.purchaseDate.split('-').reverse().join('/')}</span></p>}
                    <p>Garantia Loja: <span className={spanClasses}>90 dias</span></p>
                    <p>Garantia Fábrica: <span className={spanClasses}>1 ano</span></p>
                    {v.extendedWarranty && v.extendedWarrantyTime && (
                      <p>Garantia Estendida: <span className={spanClasses}>{v.extendedWarrantyTime}</span></p>
                    )}
                  </>
                ) : (
                  <>
                    <p>Modelo: <span className={spanClasses}>{v.model}</span></p>
                    <p>Cor: <span className={spanClasses}>{v.color}</span></p>
                    <p>Placa: <span className={spanClasses}>{v.plate}</span></p>
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs flex flex-col gap-1 justify-between text-white/50">
                      <span>IPVA: {v.ipvaExempt ? 'Isento' : (v.ipvaValue ? formatCurrency(v.ipvaValue) : 'Não informado')}</span>
                      <span>LIC: {v.licensingValue ? formatCurrency(v.licensingValue) : 'Não informado'}</span>
                    </div>
                  </>
                )}
              </div>`;

content = content.replace(infoOld, infoNew);

// Add Icon Switch
// Currently it uses `<Car className="w-4 h-4 text-white/50" />`
// Let's replace Car with a dynamic icon based on v.category
const iconOld = `<Car className="w-4 h-4 text-white/50" />`;
const iconNew = `{v.category === 'appliance' ? <Monitor className="w-4 h-4 text-white/50" /> : <Car className="w-4 h-4 text-white/50" />}`;
content = content.replace(iconOld, iconNew);

// Make sure Monitor is imported from lucide-react
if (!content.includes('Monitor')) {
  content = content.replace('Car, CreditCard', 'Car, Monitor, CreditCard');
}

fs.writeFileSync('src/components/FamilyManager.tsx', content);

