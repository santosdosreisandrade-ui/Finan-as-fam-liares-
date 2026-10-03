const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

content = content.replace("import { Trash2, Edit2, X, Check, Shield, Plus, Upload, Link, AlertTriangle } from 'lucide-react';", "import { Trash2, Edit2, X, Check, Shield, Plus, Upload, Link, AlertTriangle } from 'lucide-react';\nimport { showNotification, requestNotificationPermission } from '../lib/notifications';");

content = content.replace(`    if (!("Notification" in window)) return;
    
    const checkWarranties = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }`, `    if (!("Notification" in window)) return;
    
    const checkWarranties = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await requestNotificationPermission();
      }`);

content = content.replace(/new Notification\(/g, "showNotification(");

fs.writeFileSync('src/components/FamilyManager.tsx', content);
