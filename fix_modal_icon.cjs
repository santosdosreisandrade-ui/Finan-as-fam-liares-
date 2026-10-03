const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

content = content.replace("<span className=\"text-xs text-white/70\">{getDeviceIcon(device.deviceType)} {getDeviceIcon(device.deviceType)} {device.deviceName || 'Aparelho Desconhecido'}</span>", "<span className=\"text-xs text-white/70 flex items-center gap-1\">{getDeviceIcon(device.deviceType)} {device.deviceName || 'Aparelho Desconhecido'}</span>");

// and the other one
content = content.replace("{getDeviceIcon(device.deviceType)} {getDeviceIcon(device.deviceType)} {device.deviceName || 'Aparelho Desconhecido'}", "{getDeviceIcon(device.deviceType)} {device.deviceName || 'Aparelho Desconhecido'}");

fs.writeFileSync('src/components/DevicesModal.tsx', content);
