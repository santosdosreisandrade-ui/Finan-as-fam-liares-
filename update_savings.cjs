const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

// 1. Bank Color Function
const bankColorCode = `
const getBankColor = (bankName: string) => {
  const name = bankName.toLowerCase();
  if (name.includes('nubank') || name.includes('nuinvest')) return 'bg-purple-900/40 border-purple-500/50';
  if (name.includes('inter')) return 'bg-orange-900/40 border-orange-500/50';
  if (name.includes('itaú') || name.includes('itau')) return 'bg-orange-600/40 border-blue-500/50';
  if (name.includes('bradesco')) return 'bg-red-900/40 border-red-500/50';
  if (name.includes('santander')) return 'bg-red-800/40 border-red-600/50';
  if (name.includes('banco do brasil') || name.includes('bb ')) return 'bg-yellow-900/40 border-blue-500/50';
  if (name.includes('caixa')) return 'bg-blue-900/40 border-orange-500/50';
  if (name.includes('xp ')) return 'bg-zinc-800/80 border-yellow-500/50';
  if (name.includes('btg')) return 'bg-blue-900/40 border-blue-400/50';
  if (name.includes('c6')) return 'bg-zinc-900/80 border-zinc-500/50';
  if (name.includes('clear')) return 'bg-blue-900/40 border-blue-500/50';
  if (name.includes('rico')) return 'bg-orange-900/40 border-orange-500/50';
  return 'bg-white/[0.02] border-white/5 hover:border-white/10';
};
`;

content = content.replace("export const SavingsManager", bankColorCode + "\nexport const SavingsManager");

// 2. Change `type` to use `applicationType` exclusively in logic
// For backwards compatibility, map it when creating saving cards.

// Replace `saving.type === 'stock'` with `(saving.applicationType === 'acoes' || saving.type === 'stock')`
content = content.replace(/saving\.type === 'stock'/g, "(saving.applicationType === 'acoes' || saving.type === 'stock')");

// Also edit the new form dropdowns
const newOptions = `
                <option value="porquinho">Porquinho</option>
                <option value="tesouro">Tesouro Direto</option>
                <option value="renda_fixa">Renda Fixa</option>
                <option value="acoes">Ações</option>
                <option value="outras">Outras</option>
`;
content = content.replace(
  /<option value="porquinho">Porquinho<\/option>\s*<option value="tesouro">Tesouro Direto<\/option>\s*<option value="outras">Outras<\/option>/g,
  newOptions
);
content = content.replace(
  /<option value="porquinho">Porquinho<\/option>\s*<option value="tesouro">Tesouro<\/option>\s*<option value="outras">Outras<\/option>/g,
  newOptions
);

fs.writeFileSync('src/components/SavingsManager.tsx', content);

