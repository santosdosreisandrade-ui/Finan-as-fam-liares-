const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const loginScreen = `
  if (!userName) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex items-center justify-center p-4">
        <form onSubmit={saveUserName} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-lg max-w-sm w-full flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-widest uppercase mb-2">Acesso ao Sistema</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest">Identifique seu aparelho</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Nome do Aparelho (ou seu nome)</label>
            <input 
              type="text" 
              value={tempUserName}
              onChange={e => setTempUserName(e.target.value)}
              className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
              placeholder="Ex: iPhone do João"
              required
            />
          </div>
          
          <button type="submit" className="bg-emerald-500 text-black font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-emerald-400 transition-colors">
            Registrar Aparelho
          </button>
        </form>
      </div>
    );
  }
`;

content = content.replace("  if (userName && !isAuthorized) {", loginScreen + "\n  if (userName && !isAuthorized) {");
fs.writeFileSync('src/App.tsx', content);
