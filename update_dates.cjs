const fs = require('fs');

function ensureDateInputImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('DateInput')) {
    const importStmt = "import { DateInput } from './DateInput';\n";
    const parts = content.split('import');
    content = parts[0] + importStmt + 'import' + parts.slice(1).join('import');
    fs.writeFileSync(file, content);
  }
}

function replaceDates(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace standard input date
  // Regex looks for: <input type="date" value={...} onChange={e => setXYZ(e.target.value)} ... />
  // We need to capture:
  // 1. value binding
  // 2. setter function
  // 3. rest of the attributes
  
  // Actually, we can use a simpler regex
  const regex = /<input\s+type="date"\s+value=\{([^}]+)\}\s+onChange=\{e\s*=>\s*([a-zA-Z0-9_]+)\(e\.target\.value\)\}(.*?)\/>/g;
  
  content = content.replace(regex, (match, value, setter, rest) => {
    // some inputs have `required className="..."` inside rest.
    // We want to pass them to DateInput. 
    // We'll wrap it like: <DateInput value={val} onChange={setter} ... />
    
    // We need to clean up the rest. `className` in `rest` becomes `className` in DateInput.
    // `containerClassName` can be added if needed, let's use `containerClassName="w-full flex-1"` if `flex-1` or `w-full` is in rest to keep layout mostly intact.
    
    let containerClass = "w-full";
    if (rest.includes('flex-1')) {
      containerClass += " flex-1";
    }
    
    return `<DateInput value={${value}} onChange={${setter}} containerClassName="${containerClass}" ${rest} />`;
  });
  
  fs.writeFileSync(file, content);
}

const files = [
  'src/components/TransactionForm.tsx',
  'src/components/EditTransactionModal.tsx',
  'src/components/FamilyManager.tsx',
  'src/components/SavingsManager.tsx'
];

files.forEach(file => {
  ensureDateInputImport(file);
  replaceDates(file);
});
