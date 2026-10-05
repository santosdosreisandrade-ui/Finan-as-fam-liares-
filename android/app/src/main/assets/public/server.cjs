var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_app = require("firebase/app");
var import_lite = require("firebase/firestore/lite");
var firebaseApp = null;
var db = null;
var DOC_REF = null;
function getDbRef() {
  if (DOC_REF) return DOC_REF;
  const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
  let firebaseConfig = {};
  if (process.env.FIREBASE_CONFIG) {
    try {
      firebaseConfig = typeof process.env.FIREBASE_CONFIG === "string" ? JSON.parse(process.env.FIREBASE_CONFIG) : process.env.FIREBASE_CONFIG;
    } catch (e) {
      console.error("Failed to parse FIREBASE_CONFIG env var", e);
    }
  } else if (import_fs.default.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.error("Failed to parse firebase config file", e);
    }
  }
  if (!firebaseConfig.projectId) {
    throw new Error("Missing projectId in Firebase configuration");
  }
  firebaseApp = (0, import_app.initializeApp)(firebaseConfig);
  const databaseId = firebaseConfig.firestoreDatabaseId || "ai-studio-finanasfamiliare-79069f9c-c347-48f1-ad08-e3ae29c00abc";
  db = (0, import_lite.getFirestore)(firebaseApp, databaseId);
  DOC_REF = (0, import_lite.doc)(db, "appData", "finances");
  return DOC_REF;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  const DB_FILE = import_path.default.join(process.cwd(), "database.json");
  app.get("/api/data", async (req, res) => {
    try {
      const ref = getDbRef();
      const docSnap = await (0, import_lite.getDoc)(ref);
      if (docSnap.exists()) {
        res.json(docSnap.data());
      } else {
        if (import_fs.default.existsSync(DB_FILE)) {
          const legacyData = JSON.parse(import_fs.default.readFileSync(DB_FILE, "utf-8"));
          await (0, import_lite.setDoc)(ref, legacyData);
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
  app.post("/api/data", async (req, res) => {
    try {
      const ref = getDbRef();
      await (0, import_lite.setDoc)(ref, req.body);
      res.json({ success: true });
    } catch (e) {
      console.error("Error writing to database", e);
      res.status(500).json({ error: "Failed to write to database" });
    }
  });
  app.get("/api/backup", async (req, res) => {
    try {
      const dbInstance = getDbRef().firestore;
      const backupRef = (0, import_lite.doc)(dbInstance, "appData", "finances_backup");
      const docSnap = await (0, import_lite.getDoc)(backupRef);
      if (docSnap.exists()) {
        res.json(docSnap.data());
      } else {
        res.json({ error: "No backup found" });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to read backup" });
    }
  });
  app.post("/api/backup", async (req, res) => {
    try {
      const ref = getDbRef();
      const docSnap = await (0, import_lite.getDoc)(ref);
      if (docSnap.exists()) {
        const dbInstance = ref.firestore;
        const backupRef = (0, import_lite.doc)(dbInstance, "appData", "finances_backup");
        const backupData = {
          ...docSnap.data() || {},
          backupTimestamp: Date.now()
        };
        await (0, import_lite.setDoc)(backupRef, backupData);
        res.json({ success: true, backupTimestamp: backupData.backupTimestamp });
      } else {
        res.status(404).json({ error: "No data to backup" });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to create backup" });
    }
  });
  let lastBackupDate = null;
  setInterval(async () => {
    const now = /* @__PURE__ */ new Date();
    if (now.getHours() === 23 && now.getMinutes() === 59) {
      const today = now.toISOString().split("T")[0];
      if (lastBackupDate !== today) {
        lastBackupDate = today;
        try {
          const ref = getDbRef();
          const docSnap = await (0, import_lite.getDoc)(ref);
          if (docSnap.exists()) {
            const dbInstance = ref.firestore;
            const backupRef = (0, import_lite.doc)(dbInstance, "appData", "finances_backup");
            await (0, import_lite.setDoc)(backupRef, {
              ...docSnap.data() || {},
              backupTimestamp: Date.now()
            });
            console.log("Auto backup successful");
          }
        } catch (e) {
          console.error("Auto backup failed", e);
        }
      }
    }
  }, 6e4);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
