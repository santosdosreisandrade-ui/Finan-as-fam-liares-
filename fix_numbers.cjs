const fs = require('fs');

const files = [
  'src/components/FamilyManager.tsx',
  'src/components/HealthManager.tsx',
  'src/components/PendingAlerts.tsx',
  'src/components/TransactionList.tsx',
  'src/components/CardsManager.tsx',
  'src/components/TransactionForm.tsx',
  'src/components/Dashboard.tsx',
  'src/components/SavingsManager.tsx',
  'src/components/PlanningManager.tsx'
];

function injectImport(content, filePath) {
  if (!content.includes('formatCurrency')) {
    const importStmt = "import { formatCurrency } from '../lib/format';\n";
    const parts = content.split('import');
    content = parts[0] + importStmt + 'import' + parts.slice(1).join('import');
  }
  return content;
}

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/\.toFixed\(2\)\.replace\('\.', ','\)/g, '.toFixed(2)');
  
  // Custom manual replacements for specific lines
  // Dashboard
  content = content.replace(/\{previousBalance\.toFixed\(2\)\}/g, "{formatCurrency(previousBalance)}");
  content = content.replace(/\{income\.toFixed\(2\)\}/g, "{formatCurrency(income)}");
  content = content.replace(/\{futureIncome\.toFixed\(2\)\}/g, "{formatCurrency(futureIncome)}");
  content = content.replace(/\{expense\.toFixed\(2\)\}/g, "{formatCurrency(expense)}");
  content = content.replace(/\{futureExpense\.toFixed\(2\)\}/g, "{formatCurrency(futureExpense)}");
  content = content.replace(/\{finalBalance\.toFixed\(2\)\}/g, "{formatCurrency(finalBalance)}");
  content = content.replace(/\{projectedBalance\.toFixed\(2\)\}/g, "{formatCurrency(projectedBalance)}");

  // SavingsManager
  content = content.replace(/\{totalInitial\.toFixed\(2\)\}/g, "{formatCurrency(totalInitial)}");
  content = content.replace(/\{totalCurrentValue\.toFixed\(2\)\}/g, "{formatCurrency(totalCurrentValue)}");
  content = content.replace(/\{totalProfit\.toFixed\(2\)\}/g, "{formatCurrency(totalProfit)}");
  content = content.replace(/\{saving\.initialAmount\.toFixed\(2\)\}/g, "{formatCurrency(saving.initialAmount)}");
  content = content.replace(/\{currentVal\.toFixed\(2\)\}/g, "{formatCurrency(currentVal)}");
  content = content.replace(/\{totalDividends\.toFixed\(2\)\}/g, "{formatCurrency(totalDividends)}");
  content = content.replace(/\{d\.amount\.toFixed\(2\)\}/g, "{formatCurrency(d.amount)}");

  // PendingAlerts
  content = content.replace(/\{tx\.amount\.toFixed\(2\)\}/g, "{formatCurrency(tx.amount)}");

  // TransactionList
  content = content.replace(/\{tx\.amount\.toFixed\(2\)\}/g, "{formatCurrency(tx.amount)}");

  // PlanningManager
  content = content.replace(/\{spent\.toFixed\(2\)\}/g, "{formatCurrency(spent)}");
  content = content.replace(/\{budget\.toFixed\(2\)\}/g, "{formatCurrency(budget)}");
  content = content.replace(/\{\(spent - budget\)\.toFixed\(2\)\}/g, "{formatCurrency(spent - budget)}");
  content = content.replace(/\{\(budget - spent\)\.toFixed\(2\)\}/g, "{formatCurrency(budget - spent)}");
  content = content.replace(/formatter=\{\(value: number\) => \`R\$ \$\{value\.toFixed\(2\)\}\`/g, "formatter={(value: number) => `R$ ${formatCurrency(value)}`");

  // CardsManager
  content = content.replace(/\{card\.limit\.toFixed\(2\)\}/g, "{formatCurrency(card.limit)}");

  // TransactionForm
  content = content.replace(/\{\(parsedAmount \/ parsedInstallments\)\.toFixed\(2\)\}/g, "{formatCurrency(parsedAmount / parsedInstallments)}");
  content = content.replace(/\{\(parsedInstallmentValue \* parsedInstallments\)\.toFixed\(2\)\}/g, "{formatCurrency(parsedInstallmentValue * parsedInstallments)}");
  content = content.replace(/\{\(\(parsedInstallmentValue \* parsedInstallments\) - parsedAmount\)\.toFixed\(2\)\}/g, "{formatCurrency((parsedInstallmentValue * parsedInstallments) - parsedAmount)}");

  // FamilyManager
  content = content.replace(/\{v\.ipvaValue\.toFixed\(2\)\}/g, "{formatCurrency(v.ipvaValue)}");
  content = content.replace(/\{v\.licensingValue\.toFixed\(2\)\}/g, "{formatCurrency(v.licensingValue)}");

  // HealthManager
  content = content.replace(/\{payload\[0\]\.value\.toFixed\(2\)\}/g, "{formatCurrency(payload[0].value)}");

  if (content !== original) {
    content = injectImport(content, file);
    fs.writeFileSync(file, content);
  }
}
