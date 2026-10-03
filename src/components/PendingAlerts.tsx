import { formatCurrency } from "../lib/format";
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bell, BellRing } from 'lucide-react';
import { Transaction } from '../types';
import { showNotification, requestNotificationPermission } from '../lib/notifications';

interface Props {
  transactions: Transaction[];
  onToggleStatus: (id: string) => void;
}

export const PendingAlerts: React.FC<Props> = ({ transactions, onToggleStatus }) => {
  const [permission, setPermission] = useState('Notification' in window ? window.Notification.permission : 'default');

  const getDayStr = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getDayStr(0);
  const tomorrowStr = getDayStr(1);
  const dayTwoStr = getDayStr(2);
  const dayThreeStr = getDayStr(3);
  
  const alerts = transactions.filter(tx => 
    tx.status === 'pending' && 
     
    (tx.date || '') <= dayThreeStr
  ).sort((a, b) => ((a.date || "").localeCompare(b.date || "")));

  useEffect(() => {
    if ('Notification' in window && alerts.length > 0 && permission === 'granted') {
      const lastPush = localStorage.getItem('last_push_date');
      if (lastPush !== todayStr) {
         showNotification('Contas Pendentes - Finanças', {
            body: `Você tem ${alerts.length} conta(s) próxima(s) do vencimento ou atrasada(s). Acompanhe no app.`,
         });
         localStorage.setItem('last_push_date', todayStr);
      }
    }
  }, [alerts.length, permission, todayStr]);

  const requestPush = async () => {
    if ('Notification' in window) {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm === 'granted') {
        showNotification('Lembretes Ativados!', { body: 'Você receberá avisos sobre contas próximas do vencimento.' });
      } else {
        alert('As notificações foram bloqueadas nas configurações do seu navegador.');
      }
    } else {
      alert('Seu navegador não suporta notificações.');
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="p-5 bg-amber-500/10 border border-amber-500/20 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-500">
          <Bell className="w-5 h-5" />
          <h3 className="text-xs uppercase tracking-widest font-bold">Atenção: Contas Vencidas ou Próximas</h3>
        </div>
        
        {permission !== 'granted' && (
          <button onClick={requestPush} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black px-2 py-1 transition-colors rounded">
            <BellRing className="w-3 h-3" />
            Ativar Push
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map(tx => {
          const isOverdue = (tx.date || '') < todayStr;
          const isToday = (tx.date || '') === todayStr;
          const isTomorrow = (tx.date || '') === tomorrowStr;
          const isDayTwo = (tx.date || '') === dayTwoStr;
          
          let dateLabel = 'Em 3 dias';
          if (isOverdue) dateLabel = 'Atrasada';
          else if (isToday) dateLabel = 'Vence Hoje';
          else if (isTomorrow) dateLabel = 'Vence Amanhã';
          else if (isDayTwo) dateLabel = 'Em 2 dias';

          return (
            <div key={tx.id} className="flex items-center justify-between bg-black/20 border border-white/5 p-3 group">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] uppercase font-bold px-2 py-1 tracking-wider ${isOverdue ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {dateLabel}
                </span>
                <span className="text-sm font-medium text-white">{tx.description}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-tighter hidden md:inline">
                  {(tx.date ? new Date(tx.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'S/ Data')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${isOverdue ? 'text-rose-400' : 'text-amber-400'}`}>
                  R$ {formatCurrency(tx.amount)}
                </span>
                <button 
                  onClick={() => onToggleStatus(tx.id)}
                  className="text-[10px] uppercase tracking-wider bg-white/5 hover:bg-emerald-500 hover:text-black text-white/60 px-3 py-1.5 transition-colors"
                >
                  Pagar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
