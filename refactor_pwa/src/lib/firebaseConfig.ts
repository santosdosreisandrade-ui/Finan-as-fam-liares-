import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

// O config deve ser populado com variáveis de ambiente em produção (ex: VITE_FIREBASE_API_KEY)
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seu-projeto-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// 1. Inicializa App
export const app = initializeApp(firebaseConfig);

// 2. Inicializa Firestore com Suporte Nativo a Cache Offline e Múltiplas Abas (Substituindo o LocalStorage manual)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// 3. Inicializa Auth
export const auth = getAuth(app);

// 4. Inicializa Messaging (Pode falhar em navegadores como Safari sem PWA instalado)
export const messaging = typeof window !== 'undefined' && 'Notification' in window 
  ? getMessaging(app) 
  : null;
