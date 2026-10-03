const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

// Add states
content = content.replace(
  /const \[vName, setVName\] = useState\(''\);/,
  "const [vName, setVName] = useState('');\n  const [vMachineType, setVMachineType] = useState('');\n  const [vPurchaseDate, setVPurchaseDate] = useState('');\n  const [vWarranty, setVWarranty] = useState('');"
);
content = content.replace(
  /const \[editVName, setEditVName\] = useState\(''\);/,
  "const [editVName, setEditVName] = useState('');\n  const [editVMachineType, setEditVMachineType] = useState('');\n  const [editVPurchaseDate, setEditVPurchaseDate] = useState('');\n  const [editVWarranty, setEditVWarranty] = useState('');"
);

// Add to handleAddMachine
content = content.replace(
  /plate: vPlate,/,
  "plate: vPlate,\n      machineType: vMachineType,\n      purchaseDate: vPurchaseDate,\n      warranty: vWarranty,"
);
content = content.replace(
  /setVName\(''\); setVBrand\(''\); setVColor\(''\); setVModel\(''\); setVPlate\(''\); setVIpva\(''\); setVIpvaExempt\(false\); setVLicensing\(''\);/,
  "setVName(''); setVBrand(''); setVColor(''); setVModel(''); setVPlate(''); setVIpva(''); setVIpvaExempt(false); setVLicensing(''); setVMachineType(''); setVPurchaseDate(''); setVWarranty('');"
);

// Add to startEditMachine
content = content.replace(
  /setEditVPlate\(v.plate\);/,
  "setEditVPlate(v.plate);\n    setEditVMachineType(v.machineType || '');\n    setEditVPurchaseDate(v.purchaseDate || '');\n    setEditVWarranty(v.warranty || '');"
);

// Add to saveEditMachine
content = content.replace(
  /plate: editVPlate,/,
  "plate: editVPlate,\n      machineType: editVMachineType,\n      purchaseDate: editVPurchaseDate,\n      warranty: editVWarranty,"
);

// Inputs for new machine
const machineInputsNew = `
            <div className="flex flex-col gap-4 md:flex-row">
              <input type="text" value={vMachineType} onChange={e => setVMachineType(e.target.value)} placeholder="Tipo (ex: Automóvel, Trator)" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white flex-1" />
              <input type="date" value={vPurchaseDate} onChange={e => setVPurchaseDate(e.target.value)} className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white flex-1 [color-scheme:dark]" />
              <input type="text" value={vWarranty} onChange={e => setVWarranty(e.target.value)} placeholder="Garantia (ex: 2 anos)" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white flex-1" />
            </div>
`;

content = content.replace(
  /<div className="flex flex-col gap-4 md:flex-row">\s*<input type="text" value=\{vBrand\}/,
  machineInputsNew + '\n            <div className="flex flex-col gap-4 md:flex-row">\n              <input type="text" value={vBrand}'
);

// Inputs for edit machine
const machineInputsEdit = `
                  <div className="flex gap-2">
                    <input type="text" value={editVMachineType} onChange={e => setEditVMachineType(e.target.value)} placeholder="Tipo de Máquina" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                    <input type="date" value={editVPurchaseDate} onChange={e => setEditVPurchaseDate(e.target.value)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1 [color-scheme:dark]" />
                    <input type="text" value={editVWarranty} onChange={e => setEditVWarranty(e.target.value)} placeholder="Garantia" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                  </div>
`;

content = content.replace(
  /<div className="flex gap-2">\s*<input type="text" value=\{editVBrand\}/,
  machineInputsEdit + '\n                  <div className="flex gap-2">\n                    <input type="text" value={editVBrand}'
);

// Display fields in card
const machineFieldsDisplay = `
                {v.machineType && <p>Tipo: <span className={spanClasses}>{v.machineType}</span></p>}
                {v.purchaseDate && <p>Compra: <span className={spanClasses}>{v.purchaseDate.split('-').reverse().join('/')}</span></p>}
                {v.warranty && <p>Garantia: <span className={spanClasses}>{v.warranty}</span></p>}
`;

content = content.replace(
  /<p>Placa: <span className=\{spanClasses\}>\{v.plate\}<\/span><\/p>/,
  "<p>Placa: <span className={spanClasses}>{v.plate}</span></p>\n" + machineFieldsDisplay
);

fs.writeFileSync('src/components/FamilyManager.tsx', content);
