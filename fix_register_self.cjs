const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const onRegisterSelfOld = /onRegisterSelf=\{\(name, deviceName\) => \{[\s\S]*?setRemoteData\(newData\);\n            localStorage\.setItem\('fintrack_username', name\);\n            setUserName\(name\);\n          \}\}/m;
const onRegisterSelfNew = `
          onRegisterSelf={async (name, deviceName) => {
            const latestData = await getRemoteData();
            const newDevices = { ...(latestData.devices || {}) };
            newDevices[deviceId] = {
              id: deviceId,
              userName: name,
              deviceName: deviceName,
              status: 'authorized',
              requestedAt: Date.now()
            };
            const newData = { ...latestData, devices: newDevices };
            setData(newData);
            setRemoteData(newData);
            localStorage.setItem('fintrack_username', name);
            setUserName(name);
          }}
`;
content = content.replace(onRegisterSelfOld, onRegisterSelfNew.trim());
fs.writeFileSync('src/App.tsx', content);
