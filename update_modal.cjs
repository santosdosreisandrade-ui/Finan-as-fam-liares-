const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

// Update onRegisterSelf type (already done maybe? Let's assume it's just name now)
content = content.replace("onRegisterSelf?: (name: string, deviceName: string, deviceType: 'smartphone' | 'tablet' | 'pc') => void;", "onRegisterSelf?: (name: string) => void;");

// Update the prompt
const oldPrompt = `            const name = window.prompt('Seu Usuário (Nome):', currentDevice?.userName || '');
            if (!name || !name.trim()) return;
            const deviceName = window.prompt('Marca e Modelo do Aparelho (Ex: iPhone 18):', currentDevice?.deviceName || '');
            if (!deviceName || !deviceName.trim()) return;
            const dt = window.prompt('Tipo de Aparelho:\\n1 - Celular\\n2 - Tablet\\n3 - PC/Notebook', '1');
            const typeMap: any = { '1': 'smartphone', '2': 'tablet', '3': 'pc' };
            const finalType = typeMap[dt?.trim() || '1'] || 'smartphone';
            if (onRegisterSelf) onRegisterSelf(name.trim(), deviceName.trim(), finalType);`;

const newPrompt = `            const name = window.prompt('Seu Usuário (Nome):', currentDevice?.userName || '');
            if (!name || !name.trim()) return;
            if (onRegisterSelf) onRegisterSelf(name.trim());`;
            
content = content.replace(oldPrompt, newPrompt);

// Display ADMINISTRADOR for 4107 or 4701
content = content.replace("{device.userName}", "{(device.userName === '4107' || device.userName === '4701') ? 'ADMINISTRADOR' : device.userName}");

fs.writeFileSync('src/components/DevicesModal.tsx', content);
