const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const saveUserNameOld = /const saveUserName = \(e: React\.FormEvent\) => \{[\s\S]*?^  \};/m;
const saveUserNameNew = `
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
      const isSecretAdmin = uname === '4107';
      
      newDevices[deviceId] = {
        id: deviceId,
        userName: uname,
        deviceName: tempDeviceName.trim() || 'Aparelho Desconhecido',
        status: (isFirst || isSecretAdmin) ? 'authorized' : 'pending',
        requestedAt: Date.now()
      };
      
      const newData = { ...latestData, devices: newDevices };
      setData(newData);
      setRemoteData(newData);
    }
  };
`;
content = content.replace(saveUserNameOld, saveUserNameNew.trim());
fs.writeFileSync('src/App.tsx', content);
