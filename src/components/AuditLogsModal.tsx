import React from 'react';
import { X, ClipboardList } from 'lucide-react';
import { AuditLog } from '../types';

interface Props {
  onClose: () => void;
  logs: Record<string, AuditLog>;
}

export const AuditLogsModal: React.FC<Props> = ({ onClose, logs }) => {
  const sortedLogs = Object.values(logs).sort((a, b) => b.timestamp - a.timestamp);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Criou': return 'text-emerald-400';
      case 'Editou': return 'text-amber-400';
      case 'Excluiu': return 'text-rose-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded max-w-lg w-full relative flex flex-col max-h-[80vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-5 h-5"/>
        </button>
        <h2 className="text-lg text-white font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <ClipboardList className="w-5 h-5"/> Registros
        </h2>
        
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
          {sortedLogs.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">Nenhum registro encontrado.</p>
          ) : (
            sortedLogs.map(log => (
              <div key={log.id} className="p-4 bg-white/5 border border-white/10 rounded flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-current ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </div>
                <p className="text-sm text-white">
                  <strong className="font-semibold text-emerald-400/80">{log.userName}</strong> {log.action.toLowerCase()} o item <strong className="text-white">{log.entityName}</strong> na seção <strong className="text-white/70">{log.entityType}</strong>.
                </p>
                {log.details && (
                  <p className="text-xs text-white/50">{log.details}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
