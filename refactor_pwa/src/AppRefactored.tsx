import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebaseConfig';
import { requestPushPermissionAndSaveToken } from './lib/notificationService';
import { LocalData } from './types';
import { Dashboard } from './components/Dashboard';

export function App() {
  const [data, setData] = useState<LocalData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 1. OUVINTE DE AUTENTICAÇÃO E INJEÇÃO DO TOKEN FCM
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // Ao logar com sucesso, pede permissão de Push Native (FCM) 
      // e envia o Device Token para o Backend Firestore 
      if (currentUser) {
        requestPushPermissionAndSaveToken(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  // 2. SINCRONIZAÇÃO NATIVA OFFLINE-FIRST
  // Sem chamadas '/api/data'. O Firebase JS SDK toma conta do IndexedDB Cache.
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'appData', 'finances');
    
    // onSnapshot automaticamente serve dados locais offline (Latência zero)
    // E ouve mudanças em tempo real quando estiver online.
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as LocalData);
      } else {
        // Inicializando estado na nuvem caso não exista
        const initialState = { transactions: {}, categories: [] };
        setData(initialState);
      }
    }, (error) => {
      console.error("Erro ao sincronizar Firestore", error);
    });

    return unsubscribe; // Desmontar listener
  }, [user]);

  // Função centralizada e refatorada de salvamento.
  // Graças ao persistentLocalCache, não precisamos fazer "fallback" manual no localStorage
  const applyDataChange = async (newData: LocalData) => {
    // Optimistic UI Update (Seta instantaneamente para o usuário não esperar a internet)
    setData(newData); 
    
    try {
      const docRef = doc(db, 'appData', 'finances');
      // O SDK gerencia a fila e resolução. Se estiver offline, salva no IndexedDB e 
      // despacha automaticamente quando voltar a ficar online!
      await setDoc(docRef, newData, { merge: true });
    } catch (e) {
      console.error("Firebase SDK Offline Merge Queue Error: ", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      alert("Falha na autenticação: E-mail ou senha incorretos.");
    }
  };

  // --- RENDERS ---
  if (authLoading) return <div className="p-8 text-white">Carregando Identidade...</div>;

  // Substitui a Tela de Bloqueio com UUID Ingênuo por Autenticação Forte
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#050505] p-6 border border-white/10 flex flex-col gap-4 w-full max-w-sm rounded">
          <h2 className="text-white text-lg font-bold uppercase tracking-widest text-center">Acesso Seguro</h2>
          <input 
            type="email" 
            placeholder="E-mail Administrativo" 
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="p-3 bg-[#020202] text-white border border-white/10"
            required
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="p-3 bg-[#020202] text-white border border-white/10"
            required
          />
          <button type="submit" className="bg-white text-black font-bold p-3 uppercase hover:bg-white/80 transition-colors">
            Acessar Finanças
          </button>
        </form>
      </div>
    );
  }

  // Se logado e com dados (do cache ou da nuvem), injeta na Dashboard Original.
  if (!data) return <div className="p-8 text-white">Sincronizando cofre local...</div>;

  return <Dashboard data={data} onUpdate={applyDataChange} userName={user.email} currentDevice={{ id: "auth-device" }} />;
}
