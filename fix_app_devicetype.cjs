const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("const [tempDeviceName, setTempDeviceName] = useState('');", "const [tempDeviceName, setTempDeviceName] = useState('');\n  const [tempDeviceType, setTempDeviceType] = useState<'smartphone' | 'tablet' | 'pc'>('smartphone');");

const oldNewDevice = `        deviceName: tempDeviceName.trim() || 'Aparelho Desconhecido',
        status: (isFirst || isSecretAdmin) ? 'authorized' : 'pending',`;
const newNewDevice = `        deviceName: tempDeviceName.trim() || 'Aparelho Desconhecido',
        deviceType: tempDeviceType,
        status: (isFirst || isSecretAdmin) ? 'authorized' : 'pending',`;
content = content.replace(oldNewDevice, newNewDevice);

const oldDeviceNameInput = `<label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Aparelho (Marca e Modelo)</label>
              <input 
                type="text" 
                value={tempDeviceName}
                onChange={e => setTempDeviceName(e.target.value)}
                className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Ex: iPhone 18, Samsung S24+"
                required
              />
            </div>`;

const newDeviceNameInput = `<label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Aparelho (Marca e Modelo)</label>
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
            </div>`;

content = content.replace(oldDeviceNameInput, newDeviceNameInput);

// update onRegisterSelf
const oldOnRegisterSelf = `onRegisterSelf={async (name, deviceName) => {`;
const newOnRegisterSelf = `onRegisterSelf={async (name, deviceName, deviceType) => {`;
content = content.replace(oldOnRegisterSelf, newOnRegisterSelf);

const oldOnRegisterDevice = `              deviceName: deviceName,
              status: 'authorized',`;
const newOnRegisterDevice = `              deviceName: deviceName,
              deviceType: deviceType,
              status: 'authorized',`;
content = content.replace(oldOnRegisterDevice, newOnRegisterDevice);

fs.writeFileSync('src/App.tsx', content);
