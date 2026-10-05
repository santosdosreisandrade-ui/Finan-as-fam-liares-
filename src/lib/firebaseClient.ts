import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc } from 'firebase/firestore/lite';

export const firebaseConfig = {
  projectId: 'acoustic-solution-pmbw7',
  appId: '1:447508246531:web:45a421590a4568962d9e36',
  apiKey: 'AIzaSyAJWE55LQHdciNVTCaccekto_VMqJV013I',
  authDomain: 'acoustic-solution-pmbw7.firebaseapp.com',
  storageBucket: 'acoustic-solution-pmbw7.firebasestorage.app',
  messagingSenderId: '447508246531'
};

export const FIRESTORE_DATABASE_ID = 'ai-studio-finanasfamiliare-79069f9c-c347-48f1-ad08-e3ae29c00abc';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app, FIRESTORE_DATABASE_ID);
export const financesDocRef = doc(firestoreDb, 'appData', 'finances');
