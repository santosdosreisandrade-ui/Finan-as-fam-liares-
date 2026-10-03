const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const notifHook = `
  const prevPendingRef = useRef(pendingDevices.length);
  useEffect(() => {
    if (isAuthorized && pendingDevices.length > prevPendingRef.current) {
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
            console.error('Failed to show notification', e);
          }
        }
      }
    }
    prevPendingRef.current = pendingDevices.length;
  }, [pendingDevices.length, isAuthorized]);
`;

content = content.replace("const pendingDevices = Object.values(data.devices || {}).filter(d => d.status === 'pending');", "const pendingDevices = Object.values(data.devices || {}).filter(d => d.status === 'pending');\n" + notifHook);

fs.writeFileSync('src/App.tsx', content);
