const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore/lite');
const fs = require('fs');
const path = require('path');

async function check() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  let firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const firebaseApp = initializeApp(firebaseConfig);
  const databaseId = firebaseConfig.firestoreDatabaseId || 'ai-studio-finanasfamiliare-79069f9c-c347-48f1-ad08-e3ae29c00abc';
  const db = getFirestore(firebaseApp, databaseId);
  
  const colRef = collection(db, 'appData');
  const docs = await getDocs(colRef);
  console.log("Documents in appData:");
  docs.forEach(d => console.log(d.id, Object.keys(d.data())));
}
check().catch(console.error);
