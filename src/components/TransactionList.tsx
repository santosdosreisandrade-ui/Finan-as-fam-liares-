import { formatCurrency } from "../lib/format";
import React from 'react';
import { PersonName, parsePersonName } from './PersonName';
import { Trash2, Edit2, CheckCircle } from 'lucide-react';
import { Transaction, Card, Person } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { getPetContainerClasses, getPetBackgroundStyle } from '../lib/petUtils';


interface Props {
  transactions: Transaction[];
  cards?: Record<string, Card>;
  people?: Record<string, Person>;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
}

export const TransactionList: React.FC<Props> = ({ transactions, cards = {}, people = {}, onDelete, onToggleStatus, onEdit }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma transação registrada.
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const pastAndPresent = transactions.filter(tx => !tx.date || tx.date <= todayStr);
  const future = transactions.filter(tx => tx.date && tx.date > todayStr);

  const renderTransaction = (tx: Transaction) => {
    const isPet = tx.paidBy && people[tx.paidBy]?.role === 'pet';
    const petSpecies = isPet ? people[tx.paidBy]?.species : '';
    let containerClass = `flex items-center justify-between p-4 border-l-2 ${tx.type === 'income' ? 'border-emerald-500' : 'border-rose-500'} group hover:bg-white/[0.05] transition-all ${tx.status === 'pending' ? 'opacity-60' : ''}`;
    
    let style = {};
    if (isPet) {
      containerClass += ' ' + getPetContainerClasses(petSpecies).replace('bg-orange-500/10', 'bg-orange-500/5').replace('bg-blue-500/10', 'bg-blue-500/5').replace('bg-cyan-500/10', 'bg-cyan-500/5').replace('bg-amber-500/10', 'bg-amber-500/5').replace('bg-sky-500/10', 'bg-sky-500/5').replace('bg-pink-500/10', 'bg-pink-500/5').replace('bg-emerald-800/20', 'bg-emerald-800/10').replace('bg-zinc-500/10', 'bg-zinc-500/5');
      style = getPetBackgroundStyle(petSpecies);
    } else {
      containerClass += ' bg-white/[0.02]';
    }

    return (

    <div key={tx.id} className={containerClass} style={style}>
      <div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-white">{tx.description}</div>
          {tx.status === 'pending' && (
            <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-bold">Pendente</span>
          )}
          {(() => {
            if (tx.status !== 'pending') return null;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            
            if (tx.date === todayStr) return <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-bold">⚠️ Vence Hoje</span>;
            if (tx.date === tomorrowStr) return <span className="text-[8px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-bold">⚠️ Vence Amanhã</span>;
            if (tx.date < todayStr) return <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-bold">⚠️ Atrasado</span>;
            return null;
          })()}
        </div>
        <div className="text-[10px] text-white/30 uppercase tracking-tighter flex items-center gap-1.5 flex-wrap mt-1">
          <span>{(tx.date ? new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'S/ Data')}</span> • 
          <span className="flex items-center gap-1"><CategoryIcon category={tx.category} petSpecies={Object.values(people || {}).find(p => p.role === "pet")?.species} className="w-3 h-3" /> {tx.category}</span>
          {tx.paidBy && tx.status !== 'pending' && (
            <>
              <span className="text-white/20"> • </span>
              {people[tx.paidBy] ? (
                people[tx.paidBy].secretTheme === 'fluminense' ? (
                  <span className="bg-gradient-to-r from-[#8A1538]/20 via-white/10 to-[#00572D]/20 border border-[#8A1538]/50 shadow-[0_0_10px_rgba(138,21,56,0.1)] px-1.5 py-[1px] rounded text-[9px] uppercase tracking-widest font-bold text-white">
                    <PersonName rawName={people[tx.paidBy].name} />
                  </span>
                ) : (
                  <span className="px-1.5 py-[1px] rounded border border-current text-[9px] uppercase tracking-widest font-bold" style={{ color: parsePersonName(people[tx.paidBy].name).color || '#888' }}>
                    <PersonName rawName={people[tx.paidBy].name} />
                  </span>
                )
              ) : (
                <span>{tx.paidBy}</span>
              )}
            </>
          )}
          {tx.paymentMethod === 'credit' && tx.sourceId && cards[tx.sourceId] ? <span className="text-white/20"> • 💳 {cards[tx.sourceId].nickname}</span> : ''}
          {tx.paymentMethod === 'debit' ? <span className="text-white/20"> • 💳 Débito</span> : ''}
          {tx.paymentMethod === 'pix' ? <span className="text-white/20"> • 💸 Pix</span> : ''}
          {tx.paymentMethod === 'cash' ? <span className="text-white/20"> • 💵 Dinheiro</span> : ''}
          {!tx.paymentMethod && tx.sourceId && cards[tx.sourceId] ? <span className="text-white/20"> • 💳 {cards[tx.sourceId].nickname}</span> : ''}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {tx.type === 'income' ? '+' : '-'} R$ {formatCurrency(tx.amount)}
        </div>
        <div className="flex gap-3 items-center justify-end mt-2">
          {true && (
          <button 
            onClick={() => onToggleStatus(tx.id)}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors flex items-center gap-1 ${tx.status === 'pending' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10'}`}
          >
            {tx.status === 'pending' ? <><CheckCircle className="w-3 h-3" /> {tx.type === 'income' ? 'RECEBER' : 'PAGO'}</> : 'Desfazer'}
          </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(tx)}
              className="text-white/40 hover:text-emerald-400 p-1 transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => onDelete(tx.id)}
            className="text-white/40 hover:text-rose-500 p-1 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Extrato Recente</h2>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {pastAndPresent.length > 0 && pastAndPresent.map(renderTransaction)}
        
        {future.length > 0 && (
          <>
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60">Lançamentos Futuros</h2>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
            {future.map(renderTransaction)}
          </>
        )}
      </div>
    </div>
  );
};
