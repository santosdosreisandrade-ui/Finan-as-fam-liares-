const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import { Bell, BellRing, ClipboardList, Shield, CreditCard, ChevronRight, Scale, Users, Building, Home, Castle, Settings, Eye, EyeOff, LayoutGrid, Menu, Smartphone, X, Target } from 'lucide-react';", "import { Bell, BellRing, ClipboardList, Shield, CreditCard, ChevronRight, Scale, Users, Building, Home, Castle, Settings, Eye, EyeOff, LayoutGrid, Menu, Smartphone, X, Target, Database } from 'lucide-react';");
content = content.replace("import { AuditLogsModal } from './components/AuditLogsModal';", "import { AuditLogsModal } from './components/AuditLogsModal';\nimport { MemoryModal } from './components/MemoryModal';");

content = content.replace("const [showDevices, setShowDevices] = useState(false);", "const [showDevices, setShowDevices] = useState(false);\n  const [showMemory, setShowMemory] = useState(false);");

const newButton = `
                <button 
                  onClick={() => { setShowMemory(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors"
                >
                  <Database className="w-4 h-4" /> Memória
                </button>
                <button 
`;
content = content.replace("                <button \n                  onPointerDown={() => {", newButton + "                  onPointerDown={() => {");


const modalComponent = `
      {showMemory && (
        <MemoryModal 
          onClose={() => setShowMemory(false)}
          isAdmin={userName === '4107'}
          onRestore={(backupData) => {
            const newData = { ...data, ...backupData };
            setData(newData);
            setRemoteData(newData);
          }}
        />
      )}`;

content = content.replace("{showSecurity && <SecuritySettingsModal onClose={() => setShowSecurity(false)} />}", "{showSecurity && <SecuritySettingsModal onClose={() => setShowSecurity(false)} />}\n" + modalComponent);

fs.writeFileSync('src/App.tsx', content);
