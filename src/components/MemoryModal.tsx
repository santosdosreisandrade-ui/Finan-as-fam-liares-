import React, { useEffect, useState } from 'react';
import { X, Database, Download, Upload } from 'lucide-react';
import { LocalData } from '../types';

interface Props {
  onClose: () => void;
  isAdmin: boolean;
  onRestore: (data: LocalData) => void;
}

export const MemoryModal: React.FC<Props> = ({ onClose, isAdmin, onRestore }) => {
  const [backupTimestamp, setBackupTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/backup')
      .then(res => res.json())
      .then(data => {
        if (data.backupTimestamp) {
          setBackupTimestamp(data.backupTimestamp);
        }
      })
      .catch(console.error);
  }, []);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBackupTimestamp(data.backupTimestamp);
        alert('Backup realizado com sucesso!');
      } else {
        alert('Erro ao realizar backup: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (e) {
      alert('Erro ao realizar backup');
    }
    setLoading(false);
  };

  const handleRestore = async () => {
    if (!isAdmin) return;
    if (!window.confirm('ATENÇÃO: Restaurar o backup irá sobrescrever todos os dados atuais do aplicativo para todos os usuários. Tem certeza?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/backup');
      const data = await res.json();
      if (data && data.transactions) {
        onRestore(data);
        alert('Backup restaurado com sucesso! Os dados foram sincronizados.');
        onClose();
      } else {
        alert('Erro: Backup inválido ou vazio.');
      }
    } catch (e) {
      alert('Erro ao restaurar backup');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded max-w-lg w-full relative flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-5 h-5"/>
        </button>
        <div className="flex justify-between items-start mb-6 pr-8">
          <h2 className="text-lg text-white font-bold uppercase tracking-widest flex items-center gap-2">
            <Database className="w-5 h-5"/> Memória
          </h2>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="bg-white/5 p-4 rounded border border-white/10 text-center">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Último Backup no Servidor</p>
            <p className="text-white font-mono">
              {backupTimestamp 
                ? new Date(backupTimestamp).toLocaleString('pt-BR') 
                : 'Nenhum backup encontrado'}
            </p>
          </div>
          
          <button 
            onClick={handleBackup} 
            disabled={loading}
            className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest text-xs rounded hover:bg-emerald-500 hover:text-black transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Processando...' : 'Forçar Backup Agora'}
          </button>

          <button 
            onClick={handleRestore} 
            disabled={loading || !isAdmin}
            className={`w-full p-4 border font-bold uppercase tracking-widest text-xs rounded transition-colors flex items-center justify-center gap-2
              ${isAdmin 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black' 
                : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'}`}
          >
            <Download className="w-4 h-4" />
            {isAdmin ? 'Restaurar Backup' : 'Restaurar (Requer Modo Admin)'}
          </button>
          
        </div>
      </div>
    </div>
  );
};
