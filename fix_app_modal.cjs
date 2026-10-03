const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const userNameCode = `
  const [userName, setUserName] = useState(localStorage.getItem('fintrack_username'));
  const [tempUserName, setTempUserName] = useState('');

  const saveUserName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUserName.trim()) {
      localStorage.setItem('fintrack_username', tempUserName.trim());
      setUserName(tempUserName.trim());
    }
  };
`;

content = content.replace("export default function App() {\n  const [data, setData] = useState<LocalData>({ transactions: {} });", "export default function App() {\n  const [data, setData] = useState<LocalData>({ transactions: {} });\n" + userNameCode);

const modalCode = `
      {!userName && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <form onSubmit={saveUserName} className="bg-white/10 p-6 border border-white/20 max-w-sm w-full flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white text-center">Bem-vindo(a)!</h2>
            <p className="text-white/70 text-sm text-center">Para acompanhar quem faz cada modificação, por favor informe seu nome ou o nome deste aparelho.</p>
            <input 
              type="text" 
              value={tempUserName}
              onChange={e => setTempUserName(e.target.value)}
              placeholder="Ex: João, Celular da Maria..."
              className="bg-black/50 border border-white/10 p-3 text-white outline-none focus:border-emerald-500"
              required
            />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold p-3 uppercase tracking-widest text-xs">Começar</button>
          </form>
        </div>
      )}
`;

content = content.replace("<div className=\"min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center\">\n        <LockScreen onUnlock={() => setIsUnlocked(true)} />\n      </div>", 
"<div className=\"min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center\">\n        <LockScreen onUnlock={() => setIsUnlocked(true)} />\n      </div>\n" + modalCode);
content = content.replace("<div className=\"hidden md:flex items-center gap-6 text-sm text-white/50\">\n            <div className=\"flex items-center gap-2\">", 
modalCode + "\n<div className=\"hidden md:flex items-center gap-6 text-sm text-white/50\">\n            <div className=\"flex items-center gap-2\">");

fs.writeFileSync('src/App.tsx', content);
