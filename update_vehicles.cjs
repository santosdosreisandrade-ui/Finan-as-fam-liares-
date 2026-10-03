const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

content = content.replace(
  /<div key=\{v\.id\} className="p-4 bg-white\/5 border border-white\/10 relative group">/,
  `{(() => {
    const isKuro = v.name.toUpperCase().includes('KURO');
    const containerClasses = isKuro
      ? "p-4 bg-black border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)] relative group font-mono"
      : "p-4 bg-white/5 border border-white/10 relative group";
    const titleClasses = isKuro ? "text-sm font-black text-cyan-400 tracking-widest" : "text-sm font-medium text-white";
    const infoContainerClasses = isKuro ? "text-[10px] text-fuchsia-400 tracking-widest flex flex-col gap-1" : "text-[10px] text-white/40 uppercase tracking-widest flex flex-col gap-1";
    const spanClasses = isKuro ? "text-cyan-300 font-bold" : "text-white/80";

    return (
    <div key={v.id} className={containerClasses}>`
);

content = content.replace(
  /<h3 className="text-sm font-medium text-white">\{v\.name\}<\/h3>/,
  `<h3 className={titleClasses}>{v.name}</h3>`
);

content = content.replace(
  /<div className="text-\[10px\] text-white\/40 uppercase tracking-widest flex flex-col gap-1">/,
  `<div className={infoContainerClasses}>`
);

content = content.replace(
  /<span className="text-white\/80">\{v\.brand\}<\/span>/,
  `<span className={spanClasses}>{v.brand}</span>`
);
content = content.replace(
  /<span className="text-white\/80">\{v\.model\}<\/span>/,
  `<span className={spanClasses}>{v.model}</span>`
);
content = content.replace(
  /<span className="text-white\/80">\{v\.color\}<\/span>/,
  `<span className={spanClasses}>{v.color}</span>`
);
content = content.replace(
  /<span className="text-white\/80">\{v\.plate\}<\/span>/,
  `<span className={spanClasses}>{v.plate}</span>`
);
content = content.replace(
  /<span className="text-white\/80">\{v\.ipvaExempt \? 'Isento' : \(v\.ipvaValue \? \`R\$ \$\{v\.ipvaValue\.toFixed\(2\)\}\` : 'N\/A'\)\}<\/span>/,
  `<span className={spanClasses}>{v.ipvaExempt ? 'Isento' : (v.ipvaValue ? \`R$ \${v.ipvaValue.toFixed(2)}\` : 'N/A')}</span>`
);
content = content.replace(
  /<span className="text-white\/80">\{v\.licensingValue \? \`R\$ \$\{v\.licensingValue\.toFixed\(2\)\}\` : 'N\/A'\}<\/span>/,
  `<span className={spanClasses}>{v.licensingValue ? \`R$ \${v.licensingValue.toFixed(2)}\` : 'N/A'}</span>`
);

content = content.replace(
  /<\/div>\n\s*<\/>\n\s*\)}\n\s*<\/div>\n\s*\)\)}/,
  `              </div>
  </>
)}
            </div>
          );
          })()}
          ))}`
);

fs.writeFileSync('src/components/FamilyManager.tsx', content);
