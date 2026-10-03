
import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Shield, X } from 'lucide-react';

const bufferToBase64 = (buffer: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

export const LockScreen: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
   const bioId = localStorage.getItem('app_bio_id');

   useEffect(() => {
       if (bioId) {
           handleBiometricUnlock();
       }
   }, []);

   const handleBiometricUnlock = async () => {
       try {
           const credId = base64ToBuffer(bioId!);
           await navigator.credentials.get({
               publicKey: {
                   challenge: crypto.getRandomValues(new Uint8Array(32)),
                   allowCredentials: [{ type: "public-key", id: credId }],
                   userVerification: "required",
                   timeout: 60000
               }
           });
           onUnlock();
       } catch (e) {
           console.error("Biometric failed", e);
       }
   };

   return (
       <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center p-4">
           <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-8">
               <Lock className="w-10 h-10 text-emerald-500" />
           </div>
           <h2 className="text-xl text-white font-bold tracking-widest uppercase mb-4">App Bloqueado</h2>
           <p className="text-white/40 mb-12 text-sm max-w-xs text-center">Use a biometria ou senha do seu aparelho para continuar.</p>

           <button onClick={handleBiometricUnlock} className="flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest transition-colors">
               <Fingerprint className="w-5 h-5" /> Desbloquear
           </button>
       </div>
   );
};

export const SecuritySettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [bioEnabled, setBioEnabled] = useState(!!localStorage.getItem('app_bio_id'));
  const [isBioSupported, setIsBioSupported] = useState(false);

  useEffect(() => {
      if (window.PublicKeyCredential) {
          PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then(res => setIsBioSupported(res));
      }
  }, []);

  const setupBio = async () => {
      try {
          const credential = await navigator.credentials.create({
              publicKey: {
                  challenge: crypto.getRandomValues(new Uint8Array(32)),
                  rp: { name: "Finanças Familiares" },
                  user: {
                      id: crypto.getRandomValues(new Uint8Array(16)),
                      name: "usuario",
                      displayName: "Usuário"
                  },
                  pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
                  authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                  timeout: 60000,
              }
          });
          if (credential) {
              const credentialIdBase64 = bufferToBase64((credential as any).rawId);
              localStorage.setItem('app_bio_id', credentialIdBase64);
              setBioEnabled(true);
              alert('Biometria configurada com sucesso!');
          }
      } catch (e) {
          console.error(e);
          alert('Erro ao configurar biometria. Certifique-se de que o dispositivo possui senha, digital ou FaceID ativo.');
      }
  };

  const removeBio = () => {
      localStorage.removeItem('app_bio_id');
      setBioEnabled(false);
  };

  return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
         <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded max-w-sm w-full relative">
             <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X className="w-5 h-5"/></button>
             <h2 className="text-lg text-white font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><Shield className="w-5 h-5"/> Segurança</h2>

             <div className="flex flex-col gap-6">
                 {!isBioSupported && (
                    <p className="text-sm text-rose-400 p-4 bg-rose-500/10 rounded">Seu navegador ou dispositivo não suporta biometria integrada nativamente.</p>
                 )}
                 {isBioSupported && (
                     <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded">
                         <div>
                             <h4 className="text-white font-medium text-sm flex items-center gap-2"><Fingerprint className="w-4 h-4"/> Biometria Nativa</h4>
                             <p className="text-white/40 text-[10px] mt-1 max-w-[150px]">Use a digital, FaceID ou senha do aparelho.</p>
                             <p className="text-emerald-400/80 text-xs mt-2">{bioEnabled ? 'Ativada' : 'Desativada'}</p>
                         </div>
                         {!bioEnabled ? (
                             <button onClick={setupBio} className="text-emerald-400 text-xs font-bold uppercase hover:bg-emerald-400/10 p-2 rounded transition-colors">Ativar</button>
                         ) : (
                             <button onClick={removeBio} className="text-rose-500 text-xs font-bold uppercase hover:bg-rose-500/10 p-2 rounded transition-colors">Desativar</button>
                         )}
                     </div>
                 )}
             </div>
         </div>
      </div>
  );
};
