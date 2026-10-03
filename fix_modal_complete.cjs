const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesModal.tsx', 'utf8');

const topPart = content.split('return (')[0];

const newReturn = `return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded max-w-lg w-full relative flex flex-col max-h-[80vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-5 h-5"/>
        </button>
        <div className="flex justify-between items-start mb-6 pr-8">
          <h2 className="text-lg text-white font-bold uppercase tracking-widest flex items-center gap-2">
            <Smartphone className="w-5 h-5"/> Aparelhos
          </h2>
          <button onClick={() => {
            const name = window.prompt('Seu Usuário (Nome):', currentDevice?.userName || '');
            if (!name || !name.trim()) return;
            const deviceName = window.prompt('Marca e Modelo do Aparelho (Ex: iPhone 18):', currentDevice?.deviceName || '');
            if (!deviceName || !deviceName.trim()) return;
            if (onRegisterSelf) onRegisterSelf(name.trim(), deviceName.trim());
          }} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded uppercase tracking-widest text-[10px] font-bold transition-colors">
            Registrar Este
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
          {pending.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2 border-b border-amber-500/20 pb-2">
                <Shield className="w-3 h-3" /> Aguardando Autorização
              </h3>
              {pending.map(device => (
                <div key={device.id} className="p-3 bg-white/5 border border-amber-500/30 rounded flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-white font-bold">{device.userName}</span>
                    <span className="text-xs text-white/70">{device.deviceName || 'Aparelho Desconhecido'}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{new Date(device.requestedAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onAuthorize(device.id)} className="p-2 bg-emerald-500/20 text-emerald-500 rounded hover:bg-emerald-500 hover:text-black transition-colors" title="Autorizar">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => onRemove(device.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500/20 transition-colors" title="Rejeitar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 border-b border-emerald-500/20 pb-2">
              <Smartphone className="w-3 h-3" /> Aparelhos Autorizados
            </h3>
            {Object.keys(groupedAuthorized).length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">Nenhum aparelho autorizado.</p>
            ) : (
              Object.entries(groupedAuthorized).map(([uName, userDevices]) => (
                <div key={uName} className="mb-4 bg-white/5 border border-white/10 rounded overflow-hidden">
                  <div className="px-4 py-2 bg-black/40 border-b border-white/10">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{uName}</span>
                  </div>
                  <div className="flex flex-col">
                    {userDevices.map(device => (
                      <div key={device.id} className="p-3 border-b border-white/5 last:border-b-0 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-white/90 text-sm font-medium flex items-center gap-2">
                            {device.deviceName || 'Aparelho Desconhecido'}
                            {device.id === currentDeviceId && <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded uppercase tracking-widest">Este Aparelho</span>}
                          </span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Registrado em {new Date(device.requestedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {device.id !== currentDeviceId && (
                          <button onClick={() => onRemove(device.id)} className="p-2 text-white/20 hover:text-rose-500 hover:bg-white/5 rounded transition-colors" title="Remover acesso">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/DevicesModal.tsx', topPart + newReturn);
