const fs = require('fs');

let modalContent = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

if (!modalContent.includes('onRegisterSelf')) {
  modalContent = modalContent.replace("onRemove: (id: string) => void;", "onRemove: (id: string) => void;\n  onRegisterSelf?: (name: string) => void;");
  modalContent = modalContent.replace("onAuthorize, onRemove }) => {", "onAuthorize, onRemove, onRegisterSelf }) => {\n  const currentDevice = devices[currentDeviceId];");
  
  const headerHtml = `
        <div className="flex justify-between items-start mb-6 pr-8">
          <h2 className="text-lg text-white font-bold uppercase tracking-widest flex items-center gap-2">
            <Smartphone className="w-5 h-5"/> Aparelhos
          </h2>
          <button onClick={() => {
            const name = window.prompt('Nome ou usuário deste aparelho:', currentDevice?.userName || '');
            if (name && name.trim() && onRegisterSelf) onRegisterSelf(name.trim());
          }} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded uppercase tracking-widest text-[10px] font-bold transition-colors">
            Registrar Este
          </button>
        </div>
`;

  modalContent = modalContent.replace(/<h2 className="text-lg text-white font-bold uppercase tracking-widest mb-6 flex items-center gap-2">[\s\S]*?<\/h2>/, headerHtml.trim());
  if (!modalContent.includes("Plus")) {
    modalContent = modalContent.replace("import { X, Smartphone, Trash2, Check, Shield }", "import { X, Smartphone, Trash2, Check, Shield, Plus }");
  }
  
  fs.writeFileSync('src/components/DevicesModal.tsx', modalContent);
}

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes('onRegisterSelf')) {
  const onRegisterCode = `
          onRegisterSelf={(name) => {
            const newDevices = { ...(data.devices || {}) };
            newDevices[deviceId] = {
              id: deviceId,
              userName: name,
              status: 'authorized',
              requestedAt: Date.now()
            };
            const newData = { ...data, devices: newDevices };
            setData(newData);
            setRemoteData(newData);
            localStorage.setItem('fintrack_username', name);
            setUserName(name);
          }}
`;
  appContent = appContent.replace("onRemove={(id) => {", onRegisterCode.trim() + "\n          onRemove={(id) => {");
  fs.writeFileSync('src/App.tsx', appContent);
}

