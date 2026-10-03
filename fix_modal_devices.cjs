const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

content = content.replace("import { X, Smartphone, Trash2, Check, Shield, Plus } from 'lucide-react';", "import { X, Smartphone, Trash2, Check, Shield, Plus, Tablet, Monitor } from 'lucide-react';");

content = content.replace("onRegisterSelf?: (name: string, deviceName: string) => void;", "onRegisterSelf?: (name: string, deviceName: string, deviceType: 'smartphone' | 'tablet' | 'pc') => void;");

const getIconFn = `
  const getDeviceIcon = (type?: string) => {
    if (type === 'tablet') return <Tablet className="w-4 h-4 text-white/50" />;
    if (type === 'pc') return <Monitor className="w-4 h-4 text-white/50" />;
    return <Smartphone className="w-4 h-4 text-white/50" />;
  };
`;
content = content.replace("return (", getIconFn + "\n  return (");

const oldPrompt = `            const name = window.prompt('Seu Usuário (Nome):', currentDevice?.userName || '');
            if (!name || !name.trim()) return;
            const deviceName = window.prompt('Marca e Modelo do Aparelho (Ex: iPhone 18):', currentDevice?.deviceName || '');
            if (!deviceName || !deviceName.trim()) return;
            if (onRegisterSelf) onRegisterSelf(name.trim(), deviceName.trim());`;

const newPrompt = `            const name = window.prompt('Seu Usuário (Nome):', currentDevice?.userName || '');
            if (!name || !name.trim()) return;
            const deviceName = window.prompt('Marca e Modelo do Aparelho (Ex: iPhone 18):', currentDevice?.deviceName || '');
            if (!deviceName || !deviceName.trim()) return;
            const dt = window.prompt('Tipo de Aparelho:\\n1 - Celular\\n2 - Tablet\\n3 - PC/Notebook', '1');
            const typeMap: any = { '1': 'smartphone', '2': 'tablet', '3': 'pc' };
            const finalType = typeMap[dt?.trim() || '1'] || 'smartphone';
            if (onRegisterSelf) onRegisterSelf(name.trim(), deviceName.trim(), finalType);`;

content = content.replace(oldPrompt, newPrompt);

content = content.replace("{device.deviceName || 'Aparelho Desconhecido'}", "{getDeviceIcon(device.deviceType)} {device.deviceName || 'Aparelho Desconhecido'}");
content = content.replace("{device.deviceName || 'Aparelho Desconhecido'}", "{getDeviceIcon(device.deviceType)} {device.deviceName || 'Aparelho Desconhecido'}"); // Do it twice, once for pending, once for authorized

fs.writeFileSync('src/components/DevicesModal.tsx', content);
