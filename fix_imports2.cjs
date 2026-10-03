const fs = require('fs');
let savings = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');
savings = savings.replace("import { Vault, Plus, Trash2, Edit2, Check, X, TrendingUp, PiggyBank, Calendar } from 'lucide-react';", "import { Vault, Plus, Trash2, Edit2, Check, X, TrendingUp, PiggyBank, Calendar } from 'lucide-react';\nimport { showNotification, requestNotificationPermission } from '../lib/notifications';");
fs.writeFileSync('src/components/SavingsManager.tsx', savings);
