const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

const calculateDatesCode = `
  const getCalculatedDate = (dateStr: string, addDays = 0, addYears = 0) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    date.setUTCDate(date.getUTCDate() + addDays);
    date.setUTCFullYear(date.getUTCFullYear() + addYears);
    return date.toISOString().split('T')[0].split('-').reverse().join('/');
  };
`;

// Insert the helper function right before `return (` of FamilyManager
content = content.replace(
  "return (\n    <div className=\"flex flex-col h-full bg-black text-white relative\">",
  calculateDatesCode + "\n  return (\n    <div className=\"flex flex-col h-full bg-black text-white relative\">"
);

// Form
const oldFormWarranties = `<div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia da Loja</p>
                    <p className="text-sm text-white">90 dias após compra</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia de Fábrica</p>
                    <p className="text-sm text-white">1 ano</p>
                  </div>`;

const newFormWarranties = `<div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia da Loja</p>
                    <p className="text-sm text-white">{vPurchaseDate ? \`Até \${getCalculatedDate(vPurchaseDate, 90, 0)}\` : '90 dias'}</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia de Fábrica</p>
                    <p className="text-sm text-white">{vPurchaseDate ? \`Até \${getCalculatedDate(vPurchaseDate, 0, 1)}\` : '1 ano'}</p>
                  </div>`;
content = content.replace(oldFormWarranties, newFormWarranties);

// Also need to update it on the card view
const oldCardWarranties = `<p>Garantia Loja: <span className={spanClasses}>90 dias</span></p>
                    <p>Garantia Fábrica: <span className={spanClasses}>1 ano</span></p>`;

const newCardWarranties = `<p>Garantia Loja: <span className={spanClasses}>{v.purchaseDate ? \`Até \${getCalculatedDate(v.purchaseDate, 90, 0)}\` : '90 dias'}</span></p>
                    <p>Garantia Fábrica: <span className={spanClasses}>{v.purchaseDate ? \`Até \${getCalculatedDate(v.purchaseDate, 0, 1)}\` : '1 ano'}</span></p>`;
content = content.replace(oldCardWarranties, newCardWarranties);

fs.writeFileSync('src/components/FamilyManager.tsx', content);
