const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldButton = `                <button 
                  onClick={() => { setShowDevices(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors"
                >
                  <Smartphone className="w-4 h-4" /> Aparelhos
                </button>`;

const newButton = `                <button 
                  onPointerDown={() => {
                    (window as any).adminPressTimer = setTimeout(() => {
                      const code = window.prompt('Código de Administrador:');
                      if (code === '4107') {
                        localStorage.setItem('fintrack_username', '4107');
                        setUserName('4107');
                        setIsAppMenuOpen(false);
                        alert('Modo Administrador ativado.');
                      }
                    }, 1500);
                  }}
                  onPointerUp={() => clearTimeout((window as any).adminPressTimer)}
                  onPointerLeave={() => clearTimeout((window as any).adminPressTimer)}
                  onClick={() => { setShowDevices(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors select-none"
                >
                  <Smartphone className="w-4 h-4" /> Aparelhos
                </button>`;

content = content.replace(oldButton, newButton);
fs.writeFileSync('src/App.tsx', content);
