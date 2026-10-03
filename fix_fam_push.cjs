const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

if (!content.includes('useEffect')) {
  content = content.replace("import React, { useState, useRef } from 'react';", "import React, { useState, useRef, useEffect } from 'react';");
}

const useEffectPush = `
  useEffect(() => {
    if (!("Notification" in window)) return;
    
    const checkWarranties = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        const lastNotified = localStorage.getItem('lastWarrantyNotification');
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastNotified === todayStr) return;

        let notifiedSomething = false;

        Object.values(machines).forEach(v => {
          if (v.category === 'appliance' && v.purchaseDate) {
            const purchase = new Date(v.purchaseDate);
            if (isNaN(purchase.getTime())) return;
            
            // Loja: 90 days
            const lojaDate = new Date(purchase);
            lojaDate.setUTCDate(lojaDate.getUTCDate() + 90);
            if (lojaDate.toISOString().split('T')[0] === todayStr) {
              new Notification("Garantia Expirada", { body: \`\${v.name}: A Garantia da Loja acabou hoje.\` });
              notifiedSomething = true;
            }

            // Fabrica: 1 year
            const fabricaDate = new Date(purchase);
            fabricaDate.setUTCFullYear(fabricaDate.getUTCFullYear() + 1);
            if (fabricaDate.toISOString().split('T')[0] === todayStr) {
              new Notification("Garantia Expirada", { body: \`\${v.name}: A Garantia de Fábrica acabou hoje.\` });
              notifiedSomething = true;
            }

            // Estendida
            if (v.extendedWarranty && v.extendedWarrantyTime) {
              const months = parseInt(v.extendedWarrantyTime) || 0;
              const estendidaDate = new Date(purchase);
              estendidaDate.setUTCFullYear(estendidaDate.getUTCFullYear() + 1); // after factory
              estendidaDate.setUTCMonth(estendidaDate.getUTCMonth() + months);
              if (estendidaDate.toISOString().split('T')[0] === todayStr) {
                new Notification("Garantia Expirada", { body: \`\${v.name}: A Garantia Estendida (\${v.extendedWarrantyTime}) acabou hoje.\` });
                notifiedSomething = true;
              }
            }
          }
        });

        if (notifiedSomething) {
          localStorage.setItem('lastWarrantyNotification', todayStr);
        }
      }
    };

    checkWarranties();
  }, [machines]);
`;

content = content.replace(
  "  const [subTab, setSubTab] = useState<'people' | 'machines' | 'cards' | 'housings' | 'insurances'>('people');",
  "  const [subTab, setSubTab] = useState<'people' | 'machines' | 'cards' | 'housings' | 'insurances'>('people');\n" + useEffectPush
);

fs.writeFileSync('src/components/FamilyManager.tsx', content);
