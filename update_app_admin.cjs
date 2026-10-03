const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add tempDeviceName state
content = content.replace("const [tempUserName, setTempUserName] = useState('');", "const [tempUserName, setTempUserName] = useState('');\n  const [tempDeviceName, setTempDeviceName] = useState('');");

// 2. Update saveUserName
const saveUserNameOld = /const saveUserName = \(e: React\.FormEvent\) => \{[\s\S]*?^  \};/m;
const saveUserNameNew = `
  const saveUserName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUserName.trim()) {
      const uname = tempUserName.trim();
      localStorage.setItem('fintrack_username', uname);
      setUserName(uname);
      
      const newDevices = { ...(data.devices || {}) };
      const isFirst = Object.keys(newDevices).length === 0;
      const isSecretAdmin = uname === '4107';
      
      newDevices[deviceId] = {
        id: deviceId,
        userName: uname,
        deviceName: tempDeviceName.trim() || 'Aparelho Desconhecido',
        status: (isFirst || isSecretAdmin) ? 'authorized' : 'pending',
        requestedAt: Date.now()
      };
      
      const newData = { ...data, devices: newDevices };
      setData(newData);
      setRemoteData(newData);
    }
  };
`;
content = content.replace(saveUserNameOld, saveUserNameNew.trim());

// 3. Admin Auto-Logout Effect
const adminEffect = `
  useEffect(() => {
    if (userName === '4107') {
      const timer = setTimeout(() => {
        localStorage.removeItem('fintrack_username');
        setUserName(null);
        alert('Modo Administrador expirado. Acesso finalizado.');
      }, 10 * 60 * 1000); // 10 minutes
      return () => clearTimeout(timer);
    }
  }, [userName]);
`;
content = content.replace("  useEffect(() => {\n    if (userName && !currentDevice", adminEffect + "\n  useEffect(() => {\n    if (userName && !currentDevice");

// 4. Update applyDataChange for AuditLogs
const applyDataOld = /const applyDataChange = \(newData: LocalData, action: 'Criou' \| 'Editou' \| 'Excluiu', entityType: string, entityName: string\) => \{[\s\S]*?const log = \{/m;
const applyDataNew = `
  const applyDataChange = (newData: LocalData, action: 'Criou' | 'Editou' | 'Excluiu', entityType: string, entityName: string) => {
    const rawUserName = localStorage.getItem('fintrack_username') || 'Desconhecido';
    const logUserName = rawUserName === '4107' ? 'Administrador' : rawUserName;
    const log = {
`;
content = content.replace(applyDataOld, applyDataNew.trim());

// 5. Update header with "Modo Administrador"
content = content.replace('<h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças</h1>', '<h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças {userName === "4107" && <span className="ml-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded align-middle">Modo Administrador</span>}</h1>');

// 6. Update Login Screen Inputs
const loginOld = /<div className="flex flex-col gap-2">[\s\S]*?<label className="text-\[10px\] text-white\/40 font-bold uppercase tracking-widest">Nome do Aparelho \(ou seu nome\)<\/label>[\s\S]*?<\/div>/m;
const loginNew = `
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Seu Usuário (Nome)</label>
              <input 
                type="text" 
                value={tempUserName}
                onChange={e => setTempUserName(e.target.value)}
                className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Ex: João"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Aparelho (Marca e Modelo)</label>
              <input 
                type="text" 
                value={tempDeviceName}
                onChange={e => setTempDeviceName(e.target.value)}
                className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Ex: iPhone 18, Samsung S24+"
                required
              />
            </div>
          </div>
`;
content = content.replace(loginOld, loginNew.trim());

// 7. Update onRegisterSelf in App.tsx
const onRegisterSelfOld = /onRegisterSelf=\{\(name\) => \{[\s\S]*?newDevices\[deviceId\] = \{[\s\S]*?userName: name,[\s\S]*?status: 'authorized',/m;
const onRegisterSelfNew = `
          onRegisterSelf={(name, deviceName) => {
            const newDevices = { ...(data.devices || {}) };
            newDevices[deviceId] = {
              id: deviceId,
              userName: name,
              deviceName: deviceName,
              status: 'authorized',
`;
content = content.replace(onRegisterSelfOld, onRegisterSelfNew.trim());

fs.writeFileSync('src/App.tsx', content);
