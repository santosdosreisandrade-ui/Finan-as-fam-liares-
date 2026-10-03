const fs = require('fs');

let f1 = fs.readFileSync('src/components/TransactionForm.tsx', 'utf8');
f1 = f1.replace(
  /<input type="date" value=\{date\} onChange=\{e => setDate\(e\.target\.value\)\}\s*className="w-full bg-white\/5 border border-white\/10 p-3 text-sm focus:border-emerald-500\/50 outline-none text-white \[color-scheme:dark\]" \/>/g,
  '<DateInput value={date} onChange={setDate} className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" containerClassName="w-full" />'
);
fs.writeFileSync('src/components/TransactionForm.tsx', f1);

let f2 = fs.readFileSync('src/components/EditTransactionModal.tsx', 'utf8');
f2 = f2.replace(
  /<input type="date" value=\{date\} onChange=\{e => setDate\(e\.target\.value\)\}\s*className="bg-\[\#050505\] border border-white\/10 p-3 text-sm focus:border-emerald-500\/50 outline-none text-white \[color-scheme:dark\]" \/>/g,
  '<DateInput value={date} onChange={setDate} className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" containerClassName="w-full" />'
);
fs.writeFileSync('src/components/EditTransactionModal.tsx', f2);

