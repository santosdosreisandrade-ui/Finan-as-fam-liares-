const fs = require('fs');

// Fix FamilyManager.tsx
let family = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');
family = family.replace("import { Users, Trash2, Edit2, Check, X, Plus, Copy, ChevronDown, ChevronUp } from 'lucide-react';", "import { Users, Trash2, Edit2, Check, X, Plus, Copy, ChevronDown, ChevronUp } from 'lucide-react';\nimport { showNotification, requestNotificationPermission } from '../lib/notifications';");
fs.writeFileSync('src/components/FamilyManager.tsx', family);

// Fix SavingsManager.tsx
let savings = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');
savings = savings.replace("import { Wallet, Edit2, Check, X, Trash2, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, History } from 'lucide-react';", "import { Wallet, Edit2, Check, X, Trash2, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, History } from 'lucide-react';\nimport { showNotification, requestNotificationPermission } from '../lib/notifications';");
fs.writeFileSync('src/components/SavingsManager.tsx', savings);

