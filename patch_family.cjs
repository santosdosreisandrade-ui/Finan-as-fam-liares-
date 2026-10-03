const fs = require('fs');

let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

// Add states
content = content.replace(
  "const [vName, setVName] = useState('');",
  "const [vCategory, setVCategory] = useState<'vehicle' | 'appliance'>('vehicle');\n  const [vExtendedWarranty, setVExtendedWarranty] = useState(false);\n  const [vExtendedWarrantyTime, setVExtendedWarrantyTime] = useState('');\n  const [vName, setVName] = useState('');"
);
content = content.replace(
  "const [editVName, setEditVName] = useState('');",
  "const [editVCategory, setEditVCategory] = useState<'vehicle' | 'appliance'>('vehicle');\n  const [editVExtendedWarranty, setEditVExtendedWarranty] = useState(false);\n  const [editVExtendedWarrantyTime, setEditVExtendedWarrantyTime] = useState('');\n  const [editVName, setEditVName] = useState('');"
);

// handleAddMachine
content = content.replace(
  "onAddMachine({",
  "onAddMachine({\n      category: vCategory,\n      extendedWarranty: vExtendedWarranty,\n      extendedWarrantyTime: vExtendedWarrantyTime,"
);
content = content.replace(
  /setVName\(''\); setVBrand\(''\);.*?; setVWarranty\(''\);/,
  "setVName(''); setVBrand(''); setVColor(''); setVModel(''); setVPlate(''); setVIpva(''); setVIpvaExempt(false); setVLicensing(''); setVMachineType(''); setVPurchaseDate(''); setVWarranty(''); setVCategory('vehicle'); setVExtendedWarranty(false); setVExtendedWarrantyTime('');"
);

// startEditMachine
content = content.replace(
  "setEditVPlate(v.plate);",
  "setEditVCategory(v.category || 'vehicle');\n    setEditVExtendedWarranty(v.extendedWarranty || false);\n    setEditVExtendedWarrantyTime(v.extendedWarrantyTime || '');\n    setEditVPlate(v.plate);"
);

// saveEditMachine
content = content.replace(
  "plate: editVPlate,",
  "category: editVCategory,\n      extendedWarranty: editVExtendedWarranty,\n      extendedWarrantyTime: editVExtendedWarrantyTime,\n      plate: editVPlate,"
);

// Let's write the modified content back
fs.writeFileSync('src/components/FamilyManager.tsx', content);

