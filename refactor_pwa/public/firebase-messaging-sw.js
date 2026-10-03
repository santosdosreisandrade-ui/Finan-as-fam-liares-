// Script executado em background pelo SO (Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "seu-projeto-id",
  apiKey: "sua-api-key",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Captura mensagens push quando o App PWA está fechado ou em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[ServiceWorker] Push Recebido em Segundo Plano: ', payload);
  
  const notificationTitle = payload.notification?.title || 'Notificação';
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem novos alertas.',
    icon: '/favicon.jpg',
    badge: '/favicon.jpg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
