const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove tempDeviceName and tempDeviceType
content = content.replace("const [tempDeviceName, setTempDeviceName] = useState('');", "");
content = content.replace("const [tempDeviceType, setTempDeviceType] = useState<'smartphone' | 'tablet' | 'pc'>('smartphone');", "");

// 2. Add detectDevice logic inside saveUserName
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
      const isSecretAdmin = uname === '4107';
      
      newDevices[deviceId] = {
        id: deviceId,
        userName: uname,
        deviceName: tempDeviceName.trim() || 'Aparelho Desconhecido',
        deviceType: tempDeviceType,
        status: (isFirst || isSecretAdmin) ? 'authorized' : 'pending',
        requestedAt: Date.now()
      };`;

const newSaveUserName = `  const detectDevice = () => {
    const ua = navigator.userAgent;
    let type: 'smartphone' | 'tablet' | 'pc' = 'pc';
    if (/tablet|ipad|playbook|silk/i.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)) {
      type = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      type = 'smartphone';
    }

    let name = 'Desconhecido';
    if (ua.includes('iPhone')) name = 'iPhone';
    else if (ua.includes('iPad')) name = 'iPad';
    else if (ua.includes('Mac OS')) name = 'Mac';
    else if (ua.includes('Windows')) name = 'Windows PC';
    else if (ua.includes('Android')) {
      const match = ua.match(/Android\s([^\s;]+);?\s?([^;]+)?/);
      name = match && match[2] ? \`Android (\${match[2].trim()})\` : 'Android';
    } else if (ua.includes('Linux')) name = 'Linux PC';

    return { type, name };
  };

  const saveUserName = async (e: React.FormEvent) => {
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
      };`;

content = content.replace(oldSaveUserName, newSaveUserName);

// 3. Update logUserName
content = content.replace("const logUserName = rawUserName === '4107' ? 'Administrador' : rawUserName;", "const logUserName = (rawUserName === '4107' || rawUserName === '4701') ? 'Administrador' : rawUserName;");

// 4. Update memory modal Admin check
content = content.replace("isAdmin={userName === '4107'}", "isAdmin={userName === '4107' || userName === '4701'}");
content = content.replace("if (code === '4107') {", "if (code === '4107' || code === '4701') {");

// 5. Clean up login form inputs
const oldLoginForm = `<div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Tipo de Aparelho</label>
              <select
                value={tempDeviceType}
                onChange={e => setTempDeviceType(e.target.value as any)}
                className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="smartphone">Celular</option>
                <option value="tablet">Tablet</option>
                <option value="pc">Computador</option>
              </select>
            </div>
          </div>`;

const newLoginForm = `<div className="flex flex-col gap-4">
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

content = content.replace(oldLoginForm, newLoginForm);

// 6. Update titles
content = content.replace(`<h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças {userName === "4107" && <span className="ml-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded align-middle">Modo Administrador</span>}</h1>`, `<h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças {(userName === "4107" || userName === "4701") && <span className="ml-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded align-middle">MODO ADMINISTRADOR</span>}</h1>`);

// and the other title which was just <h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças</h1>
content = content.replace(`<h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças</h1>`, `<h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças {(userName === "4107" || userName === "4701") && <span className="ml-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded align-middle">MODO ADMINISTRADOR</span>}</h1>`);

fs.writeFileSync('src/App.tsx', content);
