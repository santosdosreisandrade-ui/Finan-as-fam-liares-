const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add showLogs state
content = content.replace("const [showSecurity, setShowSecurity] = useState(false);", "const [showSecurity, setShowSecurity] = useState(false);\n  const [showLogs, setShowLogs] = useState(false);");

// Add button
const logsButton = `
                <button 
                  onClick={() => { setShowLogs(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Registros
                </button>
`;
content = content.replace("<Shield className=\"w-4 h-4\" /> Biometria\n                </button>", "<Shield className=\"w-4 h-4\" /> Biometria\n                </button>" + logsButton);

// Add LogsModal component call
content = content.replace("{showSecurity && <SecuritySettingsModal onClose={() => setShowSecurity(false)} logs={data.logs || {}} />}", "{showSecurity && <SecuritySettingsModal onClose={() => setShowSecurity(false)} logs={data.logs || {}} />}\n      {showLogs && <AuditLogsModal onClose={() => setShowLogs(false)} logs={data.logs || {}} />}");

// Import AuditLogsModal at top
content = content.replace("import { LockScreen, SecuritySettingsModal } from './components/Security';", "import { LockScreen, SecuritySettingsModal } from './components/Security';\nimport { AuditLogsModal } from './components/AuditLogsModal';");

fs.writeFileSync('src/App.tsx', content);
