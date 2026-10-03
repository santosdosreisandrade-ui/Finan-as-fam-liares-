const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

const oldSpan = `<span className="text-white/90 text-sm font-medium flex items-center gap-2">
                            {device.deviceName || 'Aparelho Desconhecido'}
                            {device.id === currentDeviceId && <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded uppercase tracking-widest">Este Aparelho</span>}
                          </span>`;

const newSpan = `<span className="text-white/90 text-sm font-medium flex items-center gap-2">
                            {getDeviceIcon(device.deviceType)}
                            {device.deviceName || 'Aparelho Desconhecido'}
                            {device.id === currentDeviceId && <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded uppercase tracking-widest">Este Aparelho</span>}
                          </span>`;

content = content.replace(oldSpan, newSpan);

fs.writeFileSync('src/components/DevicesModal.tsx', content);
