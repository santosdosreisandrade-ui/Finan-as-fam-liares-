const fs = require('fs');
let content = fs.readFileSync('src/components/PendingAlerts.tsx', 'utf8');

content = content.replace("import { Transaction } from '../types';", "import { Transaction } from '../types';\nimport { showNotification, requestNotificationPermission } from '../lib/notifications';");
content = content.replace("new window.Notification('Contas Pendentes - Finanças', {\n            body: `Você tem ${alerts.length} conta(s) próxima(s) do vencimento ou atrasada(s). Acompanhe no app.`,\n         });", "showNotification('Contas Pendentes - Finanças', {\n            body: `Você tem ${alerts.length} conta(s) próxima(s) do vencimento ou atrasada(s). Acompanhe no app.`,\n         });");
content = content.replace("const perm = await window.Notification.requestPermission();", "const perm = await requestNotificationPermission();");
content = content.replace("new window.Notification('Lembretes Ativados!', { body: 'Você receberá avisos sobre contas próximas do vencimento.' });", "showNotification('Lembretes Ativados!', { body: 'Você receberá avisos sobre contas próximas do vencimento.' });");

fs.writeFileSync('src/components/PendingAlerts.tsx', content);
