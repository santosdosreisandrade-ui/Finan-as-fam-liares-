const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import { AuditLogsModal } from './components/AuditLogsModal';", "import { AuditLogsModal } from './components/AuditLogsModal';\nimport { showNotification, requestNotificationPermission } from './lib/notifications';");

content = content.replace(`    if (isAuthorized && pendingDevices.length > prevPendingRef.current) {
      // New device request!
      if ('Notification' in window && Notification.permission === 'granted') {
        const latestDevice = pendingDevices.sort((a, b) => b.requestedAt - a.requestedAt)[0];
        if (latestDevice) {
          try {
            new Notification('Novo Aparelho Solicitando Acesso', {
              body: \`O usuário \${latestDevice.userName} quer acessar o aplicativo.\`,
              icon: '/icon-192.png',
              badge: '/icon-192.png'
            });
          } catch (e) {
            console.error('Notification error', e);
          }
        }
      }
    }`, `    if (isAuthorized && pendingDevices.length > prevPendingRef.current) {
      // New device request!
      if ('Notification' in window && Notification.permission === 'granted') {
        const latestDevice = pendingDevices.sort((a, b) => b.requestedAt - a.requestedAt)[0];
        if (latestDevice) {
          try {
            showNotification('Novo Aparelho Solicitando Acesso', {
              body: \`O usuário \${latestDevice.userName} quer acessar o aplicativo.\`,
              icon: '/icon-192.png',
              badge: '/icon-192.png'
            });
          } catch (e) {
            console.error('Notification error', e);
          }
        }
      }
    }`);

content = content.replace(`    const showNotification = async (title: string, options: any) => {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(title, options);
            return;
          }
        }
        new Notification(title, options);
      } catch (e) {
        console.error('Failed to show notification:', e);
      }
    };`, ``); // Removed because it's now imported

content = content.replace(`  const toggleNotifications = () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações.');
      return;
    }
    if (Notification.permission === 'granted') {
      checkAndSendNotifications(true);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
        if (permission === 'granted') {
          checkAndSendNotifications(true);
        }
      });
    } else {
      alert('As notificações foram bloqueadas. Habilite-as nas configurações do seu navegador.');
    }
  };`, `  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações.');
      return;
    }
    if (Notification.permission === 'granted') {
      checkAndSendNotifications(true);
    } else if (Notification.permission !== 'denied') {
      const permission = await requestNotificationPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        checkAndSendNotifications(true);
      }
    } else {
      alert('As notificações foram bloqueadas. Habilite-as nas configurações do seu navegador.');
    }
  };`);

fs.writeFileSync('src/App.tsx', content);
