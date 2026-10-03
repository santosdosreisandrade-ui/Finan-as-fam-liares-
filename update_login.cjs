const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add tempPassword state
content = content.replace("const [tempUserName, setTempUserName] = useState('');", "const [tempUserName, setTempUserName] = useState('');\n  const [tempPassword, setTempPassword] = useState('');");

// 2. Update saveUserName
const oldSaveUserName = `  const saveUserName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUserName.trim()) {
      const uname = tempUserName.trim();
      localStorage.setItem('fintrack_username', uname);
      setUserName(uname);
      
      // MUDANÇA CRÍTICA: Buscar dados mais recentes antes de salvar, 
      // para garantir que não sobrescreva a nuvem com dados locais vazios.
      const latestData = await getRemoteData();
      
      const newDevices = { ...(latestData.devices || {}) };
      const isFirst = Object.keys(newDevices).length === 0;
      const isSecretAdmin = uname === '4107' || uname === '4701';
      
      const { type, name } = detectDevice();
      
      newDevices[deviceId] = {
        id: deviceId,
        userName: uname,
        deviceName: name,
        deviceType: type,
        status: (isFirst || isSecretAdmin) ? 'authorized' : 'pending',
        requestedAt: Date.now()
      };
      
      const newData = { ...latestData, devices: newDevices };
      setData(newData);
      setRemoteData(newData);
    }
  };`;

const newSaveUserName = `  const USERS: Record<string, { name: string, password: string }> = {
    '05797215748': { name: 'Thayná', password: '241026' },
    '15091447733': { name: 'Alexandre', password: '241026' }
  };

  const saveUserName = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginInput = tempUserName.trim();
    if (!loginInput) return;
    
    let uname = loginInput;
    const isSecretAdmin = loginInput === '4107' || loginInput === '4701';
    
    if (!isSecretAdmin) {
      const userObj = USERS[loginInput];
      if (!userObj) {
        alert('Usuário não encontrado. Use o seu CPF.');
        return;
      }
      if (userObj.password !== tempPassword) {
        alert('Senha incorreta.');
        return;
      }
      uname = userObj.name;
    }

    localStorage.setItem('fintrack_username', uname);
    setUserName(uname);
    
    // MUDANÇA CRÍTICA: Buscar dados mais recentes antes de salvar, 
    // para garantir que não sobrescreva a nuvem com dados locais vazios.
    const latestData = await getRemoteData();
    
    const newDevices = { ...(latestData.devices || {}) };
    const isFirst = Object.keys(newDevices).length === 0;
    
    const { type, name } = detectDevice();
    
    newDevices[deviceId] = {
      id: deviceId,
      userName: uname,
      deviceName: name,
      deviceType: type,
      status: (isFirst || isSecretAdmin) ? 'authorized' : 'pending',
      requestedAt: Date.now()
    };
    
    const newData = { ...latestData, devices: newDevices };
    setData(newData);
    setRemoteData(newData);
  };`;

content = content.replace(oldSaveUserName, newSaveUserName);

// 3. Update the form UI to include password
const oldLoginForm = `<div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Seu Usuário ou Código de Admin</label>
              <input 
                type="text" 
                value={tempUserName}
                onChange={e => setTempUserName(e.target.value)}
                className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Ex: João"
                required
              />
            </div>
          </div>`;

const newLoginForm = `<div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">CPF ou Código de Admin</label>
              <input 
                type="text" 
                value={tempUserName}
                onChange={e => setTempUserName(e.target.value)}
                className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Apenas números"
                required
              />
            </div>
            {tempUserName !== '4107' && tempUserName !== '4701' && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Senha</label>
                <input 
                  type="password" 
                  value={tempPassword}
                  onChange={e => setTempPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="******"
                  required
                />
              </div>
            )}
          </div>`;

content = content.replace(oldLoginForm, newLoginForm);

fs.writeFileSync('src/App.tsx', content);
