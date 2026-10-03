const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The pending authorization UI
const pendingAuthCode = `
  if (userName && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-4 flex flex-col items-center justify-center gap-6">
        <Shield className="w-16 h-16 text-amber-500 opacity-80" />
        <h2 className="text-xl font-bold tracking-widest uppercase">Aguardando Autorização</h2>
        <p className="text-white/60 text-center max-w-sm text-sm">
          O seu aparelho ({userName}) solicitou acesso. Aguarde um administrador aprovar seu acesso.
        </p>
        <button onClick={() => {
          localStorage.removeItem('fintrack_username');
          setUserName(null);
        }} className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors p-2 mt-8">Trocar usuário</button>
      </div>
    );
  }
`;

content = content.replace("    if (!isUnlocked) {", pendingAuthCode + "\n    if (!isUnlocked) {");

// The floating notification and modal imports
const notifCode = `
      {pendingDevices.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-4 z-[60] animate-pulse">
          <Shield className="w-4 h-4" />
          <span>{pendingDevices.length} aparelho(s) aguardando acesso</span>
          <button onClick={() => { setShowDevices(true); }} className="bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded transition-colors">Revisar</button>
        </div>
      )}
`;

content = content.replace("return (\n    <div className=\"h-screen bg-[#050505] text-[#e0e0e0] font-sans flex overflow-hidden\">", "return (\n    <div className=\"h-screen bg-[#050505] text-[#e0e0e0] font-sans flex overflow-hidden\">\n" + notifCode);

// Aparelhos menu button
const devicesButtonCode = `
                <button 
                  onClick={() => { setShowDevices(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors"
                >
                  <Smartphone className="w-4 h-4" /> Aparelhos
                </button>
`;
content = content.replace("<ClipboardList className=\"w-4 h-4\" /> Registros\n                </button>", "<ClipboardList className=\"w-4 h-4\" /> Registros\n                </button>\n" + devicesButtonCode);

// Aparelhos modal component
const devicesModalCode = `
      {showDevices && (
        <DevicesModal 
          onClose={() => setShowDevices(false)} 
          devices={data.devices || {}} 
          currentDeviceId={deviceId}
          onAuthorize={(id) => {
            const newDevices = { ...data.devices };
            newDevices[id] = { ...newDevices[id], status: 'authorized' };
            const newData = { ...data, devices: newDevices };
            setData(newData);
            setRemoteData(newData);
          }}
          onRemove={(id) => {
            const newDevices = { ...data.devices };
            delete newDevices[id];
            const newData = { ...data, devices: newDevices };
            setData(newData);
            setRemoteData(newData);
          }}
        />
      )}
`;
content = content.replace("{showLogs && <AuditLogsModal onClose={() => setShowLogs(false)} logs={data.logs || {}} />}", "{showLogs && <AuditLogsModal onClose={() => setShowLogs(false)} logs={data.logs || {}} />}\n" + devicesModalCode);

fs.writeFileSync('src/App.tsx', content);
