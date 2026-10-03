import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

/**
 * 1. CLOUD FUNCTION: Backup Automatizado
 * Executa todos os dias às 23:59.
 * Substitui o `setInterval` rodando no Express, garantindo execução em infra serverless (GCP Cloud Scheduler).
 */
export const automatedBackup = functions.pubsub.schedule('59 23 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      const dataRef = db.doc('appData/finances');
      const docSnap = await dataRef.get();
      
      if (docSnap.exists) {
        const backupRef = db.doc('appData/finances_backup');
        // Snapshot seguro do estado do dia
        await backupRef.set({
          ...docSnap.data(),
          backupTimestamp: admin.firestore.Timestamp.now()
        });
        console.log("[BACKUP] Backup diário realizado com sucesso.");
      }
    } catch (error) {
      console.error("[BACKUP] Falha no backup automático", error);
    }
    return null;
  });

/**
 * 2. CLOUD FUNCTION: Web Push Notifications (Agendamento)
 * Executa todos os dias às 07:00 da manhã.
 * Analisa contas a vencer hoje e dispara FCM Push Direto para o celular/PWA.
 */
export const sendDueNotifications = functions.pubsub.schedule('0 7 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      const dataRef = db.doc('appData/finances');
      const docSnap = await dataRef.get();
      
      if (!docSnap.exists) return null;
      const data = docSnap.data();
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Preservando a sua lógica original de cálculo de Vencimento
      const pendingTransactions = Object.values(data?.transactions || {}).filter(
        (tx: any) => !tx.deleted && tx.type === 'expense' && tx.status === 'pending' && tx.date === todayStr
      );

      const dueCards = Object.values(data?.cards || {}).filter((card: any) => {
        if (!card.alertEnabled) return false;
        if (card.dueDateType === 'fixed') {
          return card.dueDateValue === today.getDate();
        } else {
          // Lógica dos dias úteis existente
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

      const hasPending = pendingTransactions.length > 0;
      const hasDueCards = dueCards.length > 0;

      if (!hasPending && !hasDueCards) {
        console.log("Nada a notificar hoje.");
        return null; // Nada a notificar
      }

      let bodyText = '';
      if (hasPending && hasDueCards) {
        bodyText = `Você tem ${pendingTransactions.length} conta(s) e ${dueCards.length} cartão(ões) vencendo hoje!`;
      } else if (hasPending) {
        bodyText = `Você tem ${pendingTransactions.length} conta(s) pendente(s) hoje.`;
      } else {
        bodyText = `Seu cartão ${dueCards.map((c: any) => c.nickname).join(', ')} vence hoje!`;
      }

      // Buscar Tokens FCM de todos os usuários
      const usersSnap = await db.collection('users').get();
      const tokens: string[] = [];
      usersSnap.forEach(userDoc => {
        const userTokens = userDoc.data().fcmTokens || {};
        Object.keys(userTokens).forEach(t => tokens.push(t));
      });

      if (tokens.length > 0) {
        // Envio nativo FCM (Batching via sendEachForMulticast)
        const response = await messaging.sendEachForMulticast({
          tokens: tokens,
          notification: {
            title: "Finanças Familiares",
            body: bodyText
          },
          webpush: {
            fcmOptions: {
              link: "/" // Ao clicar na push notification, abre o app
            }
          }
        });
        console.log(`[PUSH] Enviado. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`);
      }
    } catch (error) {
      console.error("[PUSH] Falha ao enviar notificações.", error);
    }
    return null;
  });
