import React, { useState, useEffect } from 'react';
import { Transaction, Card, Person } from '../types';

interface Props {
  transaction: Transaction;
  cards: Record<string, Card>;
  people: Record<string, Person>;
  onConfirm: (paymentMethod: string, sourceId: string, paidBy: string) => void;
  onCancel: () => void;
}

export const ConfirmPaymentModal: React.FC<Props> = ({ transaction, cards, people, onConfirm, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash' | ''>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>('');

  useEffect(() => {
    const personValues = Object.values(people) as Person[];
    if (personValues.length > 0) {
      setPaidBy(personValues[0].id);
    }
  }, [people]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod || (paymentMethod === 'credit' && !sourceId) || !paidBy) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    onConfirm(paymentMethod, sourceId, paidBy);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#050505] border border-white/10 p-6 flex flex-col gap-6 max-w-sm w-full">
        <h3 className="text-white font-bold tracking-widest uppercase text-sm">Confirmar Pagamento / Recebimento</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Forma de pagamento</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none">
              <option value="" className="bg-[#050505] text-white/50">Selecione...</option>
              <option value="credit" className="bg-[#050505] text-white">Crédito</option>
              <option value="debit" className="bg-[#050505] text-white">Débito</option>
              <option value="cash" className="bg-[#050505] text-white">Dinheiro</option>
              <option value="pix" className="bg-[#050505] text-white">Pix</option>
            </select>
          </div>

          {paymentMethod === 'credit' && (
            <div>
              <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Cartões Cadastrados</label>
              {Object.keys(cards).length === 0 ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  Adicione cartões na aba Cartões primeiro.
                </div>
              ) : (
                <select value={sourceId} onChange={e => setSourceId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none">
                  <option value="" disabled className="bg-[#050505] text-white/50">Selecione o cartão...</option>
                  {Object.values(cards).map((card: Card) => (
                    <option key={card.id} value={card.id} className="bg-[#050505] text-white">{card.nickname} ({card.bank})</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Pagador / Responsável</label>
            {Object.keys(people).length === 0 ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                Adicione pessoas na aba Família primeiro.
              </div>
            ) : (
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none">
                <option value="" disabled className="bg-[#050505] text-white/50">Selecione o pagador...</option>
                <optgroup label="Família" className="bg-[#050505] text-emerald-400">
                  {(Object.values(people) as Person[]).filter(p => p.role !== 'third_party').map(p => (
                    <option key={p.id} value={p.id} className="bg-[#050505] text-white">{p.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Terceiros / Outros" className="bg-[#050505] text-emerald-400">
                  {(Object.values(people) as Person[]).filter(p => p.role === 'third_party').map(p => (
                    <option key={p.id} value={p.id} className="bg-[#050505] text-white">{p.name}</option>
                  ))}
                </optgroup>
              </select>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black p-4 text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              Confirmar Pagamento / Recebimento
            </button>
            <button type="button" onClick={onCancel} className="bg-white/5 hover:bg-white/10 text-white p-4 text-xs font-bold uppercase tracking-widest transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
