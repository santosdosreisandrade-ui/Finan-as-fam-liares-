const fs = require('fs');

let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

// Fix the useState line
content = content.replace(
  "const [interestPeriod,\n      applicationType,\n      notifyUpdate,\nsetInterestPeriod]",
  "const [interestPeriod, setInterestPeriod]"
);
// Also the edit one? Let's check
content = content.replace(
  "const [editInterestPeriod,\n      applicationType: editApplicationType,\n      notifyUpdate: editNotifyUpdate,\nsetEditInterestPeriod]",
  "const [editInterestPeriod, setEditInterestPeriod]"
);

fs.writeFileSync('src/components/SavingsManager.tsx', content);

