const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const checkAndSendNotifications = async \(force = false\) => \{[\s\S]*?\}\s*\} else if \(force\) \{[\s\S]*?\}\s*\};/;

const newCheck = `const checkAndSendNotifications = async (force = false) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!data || !data.transactions) return;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check pending transactions
    const todayPending = Object.values(data.transactions)
      .filter((tx: any) => !tx.deleted && tx.type === 'expense' && tx.status === 'pending' && tx.date === todayStr);

    // Check due cards
    const dueCards = Object.values(data.cards || {}).filter((card: any) => {
      if (!card.alertEnabled) return false;
      if (card.dueDateType === 'fixed') {
        return card.dueDateValue === today.getDate();
      } else {
        let count = 0;
        for (let i = 1; i <= today.getDate(); i++) {
          const d = new Date(today.getFullYear(), today.getMonth(), i);
          if (d.getDay() !== 0 && d.getDay() !== 6) {
            count++;
          }
        }
        return card.dueDateValue === count;
      }
    });

    const hasPending = todayPending.length > 0;
    const hasDueCards = dueCards.length > 0;

    if (hasPending || hasDueCards) {
      const lastNotified = localStorage.getItem('lastNotificationDate');
      if (lastNotified !== todayStr || force) {
        let bodyText = '';
        if (hasPending && hasDueCards) {
          bodyText = \`Você tem \${todayPending.length} conta(s) pendente(s) e \${dueCards.length} cartão(ões) vencendo hoje (\${dueCards.map(c => c.nickname).join(', ')}).\`;
        } else if (hasPending) {
          bodyText = \`Você tem \${todayPending.length} conta(s) pendente(s) hoje.\`;
        } else {
          bodyText = \`Seu cartão \${dueCards.map(c => c.nickname).join(', ')} vence hoje!\`;
        }

        await showNotification('Finanças: Alertas de Hoje', {
          body: bodyText,
          icon: '/favicon.jpg'
        });
        localStorage.setItem('lastNotificationDate', todayStr);
      }
    } else if (force) {
      await showNotification('Finanças', {
        body: 'Tudo em dia! Nenhuma conta ou cartão para hoje.',
        icon: '/favicon.jpg'
      });
    }
  };`;

content = content.replace(regex, newCheck);
fs.writeFileSync('src/App.tsx', content);
