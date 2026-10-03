import { getToken } from 'firebase/messaging';
import { messaging, db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

// A chave VAPID é essencial para Web Push. Deve ser obtida no Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

export const requestPushPermissionAndSaveToken = async (userId: string) => {
  if (!messaging) return;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        // Vincula o Token FCM ao perfil do usuário no Firestore
        // Isso permite que a Cloud Function envie o Push para os dispositivos certos
        await setDoc(doc(db, 'users', userId), {
          fcmTokens: {
            [currentToken]: true // Permite salvar múltiplos tokens se ele logar no Celular e PC
          },
          updatedAt: new Date().getTime()
        }, { merge: true });
        console.log("Token FCM salvo no banco de dados.");
      }
    }
  } catch (error) {
    console.error('Falha ao registrar para notificações Web Push: ', error);
  }
};
