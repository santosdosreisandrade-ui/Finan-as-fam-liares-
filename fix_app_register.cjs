const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldReg = `          onRegisterSelf={async (name, deviceName, deviceType) => {
            const latestData = await getRemoteData();
            const newDevices = { ...(latestData.devices || {}) };
            newDevices[deviceId] = {
              id: deviceId,
              userName: name,
              deviceName: deviceName,
              deviceType: deviceType,
              status: 'authorized',
              requestedAt: Date.now()
            };`;

const newReg = `          onRegisterSelf={async (name) => {
            const latestData = await getRemoteData();
            const newDevices = { ...(latestData.devices || {}) };
            const { type, name: detectedDeviceName } = detectDevice();
            
            newDevices[deviceId] = {
              id: deviceId,
              userName: name,
              deviceName: detectedDeviceName,
              deviceType: type,
              status: 'authorized',
              requestedAt: Date.now()
            };`;

content = content.replace(oldReg, newReg);

fs.writeFileSync('src/App.tsx', content);
