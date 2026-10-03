const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

content = content.replace("import { CreditCard, Plus, Trash2, Edit2, TrendingUp, X, Check, Activity, Target } from 'lucide-react';", "import { CreditCard, Plus, Trash2, Edit2, TrendingUp, X, Check, Activity, Target } from 'lucide-react';\nimport { showNotification, requestNotificationPermission } from '../lib/notifications';");

content = content.replace(`    if (!("Notification" in window)) return;
    
    const checkAndNotify = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }`, `    if (!("Notification" in window)) return;
    
    const checkAndNotify = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await requestNotificationPermission();
      }`);

content = content.replace(`          new Notification("Atualizar Saldo (Porquinho)", {
            body: \`É dia de atualizar o saldo das reservas: \${names}\`,
          });`, `          showNotification("Atualizar Saldo (Porquinho)", {
            body: \`É dia de atualizar o saldo das reservas: \${names}\`,
          });`);

fs.writeFileSync('src/components/SavingsManager.tsx', content);
