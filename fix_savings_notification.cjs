const fs = require('fs');

let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

// Insert a banner logic at the top of SavingsManager render
const bannerCode = `
  const todayDate = new Date().getDate();
  const savingsToNotify = Object.values(savings).filter(s => {
    if (s.applicationType === 'porquinho' && s.notifyUpdate && s.startDate) {
      const startDay = new Date(s.startDate).getUTCDate();
      return todayDate === startDay;
    }
    return false;
  });
`;

content = content.replace(
  "return (\n    <div className=\"flex flex-col h-full bg-black text-white relative\">",
  bannerCode + "\n  return (\n    <div className=\"flex flex-col h-full bg-black text-white relative\">\n      {savingsToNotify.length > 0 && (\n        <div className=\"bg-fuchsia-500/20 border border-fuchsia-500/50 p-4 m-6 mb-0 text-sm text-fuchsia-100 flex flex-col gap-1\">\n          <p className=\"font-bold flex items-center gap-2\"><PiggyBank className=\"w-4 h-4\" /> Atualização de Saldo Necessária</p>\n          <p>Hoje faz mais um mês desde a criação de algumas de suas reservas no Porquinho. É um ótimo dia para atualizar o saldo delas!</p>\n          <ul className=\"list-disc list-inside opacity-80 mt-1 text-xs\">\n            {savingsToNotify.map(s => <li key={s.id}>{s.name || s.bank}</li>)}\n          </ul>\n        </div>\n      )}"
);

fs.writeFileSync('src/components/SavingsManager.tsx', content);

