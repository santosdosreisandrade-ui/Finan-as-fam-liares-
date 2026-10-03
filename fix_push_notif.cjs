const fs = require('fs');

let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

const useEffCode = `
  useEffect(() => {
    if (!("Notification" in window)) return;
    
    const checkAndNotify = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        // Prevent spamming if we already notified today
        const lastNotified = localStorage.getItem('lastSavingsNotification');
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastNotified === todayStr) return;

        const todayDate = new Date().getUTCDate();
        const savingsToNotify = Object.values(savings).filter(s => {
          if (s.applicationType === 'porquinho' && s.notifyUpdate && s.startDate) {
            const startDay = new Date(s.startDate).getUTCDate();
            return todayDate === startDay;
          }
          return false;
        });

        if (savingsToNotify.length > 0) {
          const names = savingsToNotify.map(s => s.name || s.bank).join(', ');
          new Notification("Atualizar Saldo (Porquinho)", {
            body: \`É dia de atualizar o saldo das reservas: \${names}\`,
          });
          localStorage.setItem('lastSavingsNotification', todayStr);
        }
      }
    };

    checkAndNotify();
  }, [savings]);
`;

// we need useEffect from react
if (!content.includes('useEffect')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
}

content = content.replace(
  "const totalProfit = totalCurrentValue - totalInitial;",
  "const totalProfit = totalCurrentValue - totalInitial;\n" + useEffCode
);

fs.writeFileSync('src/components/SavingsManager.tsx', content);

