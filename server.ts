import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore/lite';


let firebaseApp = null;
let db = null;
let DOC_REF = null;

function getDbRef() {
  if (DOC_REF) return DOC_REF;
  
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  let firebaseConfig: any = {};
  
  
  if (process.env.FIREBASE_CONFIG) {
    try {
      firebaseConfig = typeof process.env.FIREBASE_CONFIG === 'string' ? JSON.parse(process.env.FIREBASE_CONFIG) : process.env.FIREBASE_CONFIG;
    } catch (e) {
      console.error("Failed to parse FIREBASE_CONFIG env var", e);
    }
  } else if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error("Failed to parse firebase config file", e);
    }
  }


  if (!firebaseConfig.projectId) {
    throw new Error("Missing projectId in Firebase configuration");
  }

  firebaseApp = initializeApp(firebaseConfig);
  const databaseId = firebaseConfig.firestoreDatabaseId || 'ai-studio-finanasfamiliare-79069f9c-c347-48f1-ad08-e3ae29c00abc';
  db = getFirestore(firebaseApp, databaseId);
  DOC_REF = doc(db, 'appData', 'finances');
  
  return DOC_REF;
}


async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: '50mb' }));
  
  const DB_FILE = path.join(process.cwd(), 'database.json');

  app.get('/api/data', async (req, res) => {
    try {
      const ref = getDbRef();
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        res.json(docSnap.data());
      } else {
        if (fs.existsSync(DB_FILE)) {
          const legacyData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
          await setDoc(ref, legacyData);
          res.json(legacyData);
        } else {
          res.json({});
        }
      }
    } catch (e) {
      console.error("Error reading database", e);
      res.status(500).json({ error: "Failed to read database" });
    }
  });

  app.post('/api/data', async (req, res) => {
    try {
      const ref = getDbRef();
      await setDoc(ref, req.body);
      res.json({ success: true });
    } catch (e) {
      console.error("Error writing to database", e);
      res.status(500).json({ error: "Failed to write to database" });
    }
  });


  app.get('/api/backup', async (req, res) => {
    try {
      const dbInstance = getDbRef().firestore;
      const backupRef = doc(dbInstance, 'appData', 'finances_backup');
      const docSnap = await getDoc(backupRef);
      if (docSnap.exists()) {
        res.json(docSnap.data());
      } else {
        res.json({ error: 'No backup found' });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to read backup" });
    }
  });

  app.post('/api/backup', async (req, res) => {
    try {
      const ref = getDbRef();
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        const dbInstance = ref.firestore;
        const backupRef = doc(dbInstance, 'appData', 'finances_backup');
        const backupData = {
          ...((docSnap.data() || {}) as object),
          backupTimestamp: Date.now()
        };
        await setDoc(backupRef, backupData);
        res.json({ success: true, backupTimestamp: backupData.backupTimestamp });
      } else {
        res.status(404).json({ error: 'No data to backup' });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  // Cron-like auto backup at 23:59
  let lastBackupDate = null;
  setInterval(async () => {
    const now = new Date();
    // Brazil Time might be different, but we'll use server local time
    if (now.getHours() === 23 && now.getMinutes() === 59) {
      const today = now.toISOString().split('T')[0];
      if (lastBackupDate !== today) {
        lastBackupDate = today;
        try {
          const ref = getDbRef();
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
            const dbInstance = ref.firestore;
            const backupRef = doc(dbInstance, 'appData', 'finances_backup');
            await setDoc(backupRef, {
              ...((docSnap.data() || {}) as object),
              backupTimestamp: Date.now()
            });
            console.log("Auto backup successful");
          }
        } catch (e) {
          console.error("Auto backup failed", e);
        }
      }
    }
  }, 60000);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
