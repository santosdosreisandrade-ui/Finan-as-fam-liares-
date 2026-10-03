const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const backupRoutes = `
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
          ...docSnap.data(),
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
              ...docSnap.data(),
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

`;

content = content.replace('  if (process.env.NODE_ENV !== "production") {', backupRoutes + '  if (process.env.NODE_ENV !== "production") {');
fs.writeFileSync('server.ts', content);
