import { DateInput } from './DateInput';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Transaction, Card, Person } from '../types';

interface Props {
  transaction: Transaction;
  categories: string[];
  cards: Record<string, Card>;
  people: Record<string, Person>;
  onSave: (tx: Transaction, mode?: 'only' | 'future' | 'all') => void;
  onClose: () => void;
}

export const EditTransactionModal: React.FC<Props> = ({ transaction, categories, cards, people, onSave, onClose }) => {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(transaction.date);
  const [category, setCategory] = useState(transaction.category);
  const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod || 'cash');
  const [sourceId, setSourceId] = useState(transaction.sourceId || '');
  const [paidBy, setPaidBy] = useState(transaction.paidBy || '');
  const [status, setStatus] = useState(transaction.status || 'paid');
  
  const [showGroupPrompt, setShowGroupPrompt] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Transaction | null>(null);

  const isGroup = transaction.groupId || (transaction.description || '').match(/\(\d+\/\d+\)$|\(Fixa\)$|\(Anual\)$|\(Semanal\)$/);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) { alert('Preencha os campos obrigatórios.'); return; }
    
    const isPaid = status === 'paid';
    if (isPaid && (!paidBy || (transaction.type === 'expense' && paymentMethod === 'credit' && !sourceId))) {
      alert('Por favor, preencha os dados de pagamento (Pagador, e Cartão se aplicável).');
      return;
    }
    
    const updatedTx = {
      ...transaction,
      description,
      amount: parseFloat(amount.toString().replace(',', '.')),
      date,
      category,
      paymentMethod: paymentMethod as any,
      sourceId,
      paidBy: status === 'paid' ? paidBy : '',
      status: status as any,
      updatedAt: Date.now()
    };
    
    if (isGroup) {
      setPendingUpdate(updatedTx);
      setShowGroupPrompt(true);
    } else {
      onSave(updatedTx, 'only');
    }
  };

  const handleGroupSave = (mode: 'only' | 'future' | 'all') => {
    if (pendingUpdate) onSave(pendingUpdate, mode);
  };

  if (showGroupPrompt) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-[#050505] border border-white/10 p-6 flex flex-col gap-4 max-w-sm w-full">
          <h3 className="text-white font-bold tracking-widest uppercase text-sm">Editar Lançamento</h3>
          <p className="text-white/60 text-xs leading-relaxed">
            Este lançamento faz parte de um grupo (parcelamento ou recorrência). O que deseja alterar?
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <button onClick={() => handleGroupSave('only')} className="bg-white/5 hover:bg-emerald-500/20 text-white hover:text-emerald-400 p-3 text-xs uppercase tracking-widest transition-colors text-left border border-white/5">
              Somente este
            </button>
            <button onClick={() => handleGroupSave('future')} className="bg-white/5 hover:bg-emerald-500/20 text-white hover:text-emerald-400 p-3 text-xs uppercase tracking-widest transition-colors text-left border border-white/5">
              Este e os futuros
            </button>
            <button onClick={() => handleGroupSave('all')} className="bg-white/5 hover:bg-emerald-500/20 text-white hover:text-emerald-400 p-3 text-xs uppercase tracking-widest transition-colors text-left border border-white/5">
              Todos (incluindo anteriores)
            </button>
          </div>
          <button onClick={() => setShowGroupPrompt(false)} className="mt-2 text-white/40 hover:text-white text-xs uppercase tracking-widest p-2 transition-colors">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#080808] border border-white/10 w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Editar Lançamento</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-white/30 font-bold">Descrição</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                   className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-white/30 font-bold">Valor (R$)</label>
              <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                     className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-white/30 font-bold">Data</label>
              <DateInput value={date} onChange={setDate} className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" containerClassName="w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={`text-[10px] uppercase font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-white/30'}`}>{transaction.type === 'income' ? 'Fonte da Receita' : 'Categoria'}</label>
            {transaction.type === 'income' ? (
              <select value={category} onChange={e => setCategory(e.target.value)}
                      className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                <option value="Salário">Salário</option>
                <option value="Bônus">Bônus</option>
                <option value="Dividendos">Dividendos</option>
                <option value="Dívidas">Dívidas</option>
                <option value="Outros">Outros</option>
              </select>
            ) : (
              <select value={category} onChange={e => setCategory(e.target.value)}
                      className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {transaction.type === 'expense' && status === 'paid' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase text-white/30 font-bold">Forma de Pagamento</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}
                        className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                  <option value="credit">Crédito</option>
                  <option value="debit">Débito</option>
                  <option value="cash">Dinheiro</option>
                  <option value="pix">Pix</option>
                </select>
              </div>
            )}
            {transaction.type === 'expense' && status === 'paid' && paymentMethod === 'credit' && (
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] uppercase text-white/30 font-bold">Cartão</label>
                <select value={sourceId} onChange={e => setSourceId(e.target.value)}
                        className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                  <option value="" disabled>Selecione o cartão...</option>
                  {Object.values(cards).map((card: any) => (
                    <option key={card.id} value={card.id}>{card.nickname} ({card.bank})</option>
                  ))}
                </select>
              </div>
            )}

          <div className="grid grid-cols-2 gap-4">
            {(status === 'paid') && (<div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-white/30 font-bold">Pagador</label>
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                      className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                {Object.values(people).map((p: Person) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>)}
            
            {true && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-white/30 font-bold">Situação</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)}
                      className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
            )}
          </div>

          <button type="submit" className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-black p-4 text-xs font-bold uppercase tracking-widest transition-colors">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};
