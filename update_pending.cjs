const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

const oldPendingRender = /<span className="text-white font-bold">\{device\.userName\}<\/span>/g;
const newPendingRender = '<span className="text-white font-bold">{device.userName}</span><span className="text-xs text-white/70">{device.deviceName || \'Aparelho Desconhecido\'}</span>';

content = content.replace(oldPendingRender, newPendingRender);
fs.writeFileSync('src/components/DevicesModal.tsx', content);
