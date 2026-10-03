const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the isAuthorized logic to simply true if we have a username, 
// to instantly unlock everyone who gets past the login screen or was already stuck in pending.
content = content.replace(
  "const isAuthorized = userName === '4107' || currentDevice?.status === 'authorized' || Object.keys(data.devices || {}).length === 0;", 
  "const isAuthorized = !!userName;"
);

// Remove the "Aguardando Autorização" screen entirely so it doesn't block anyone
const waitScreen = `  if (userName && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-4 flex flex-col items-center justify-center gap-6">
        <Shield className="w-16 h-16 text-amber-500 opacity-80" />
        <h2 className="text-xl font-bold tracking-widest uppercase">Aguardando Autorização</h2>
        <p className="text-white/60 text-center max-w-sm text-sm">
          O seu aparelho ({userName}) solicitou acesso. Aguarde um administrador aprovar seu acesso.
        </p>
        <button onClick={() => {
          localStorage.removeItem('fintrack_username');
          setUserName(null);
        }} className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors p-2 mt-8">Trocar usuário</button>
      </div>
    );
  }`;

content = content.replace(waitScreen, "");

fs.writeFileSync('src/App.tsx', content);
