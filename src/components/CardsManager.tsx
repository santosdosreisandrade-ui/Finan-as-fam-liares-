import { formatCurrency } from "../lib/format";
import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';
import { CreditCard, Trash2, Plus, Edit2, Check, X, Bell, BellRing } from 'lucide-react';
import { Card, Person } from '../types';

interface Props {
  cards: Record<string, Card>;
  people?: Record<string, Person>;
  onAddCard: (card: Card) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
}

export const CardsManager: React.FC<Props> = ({ cards, people = {}, onAddCard, onUpdateCard, onDeleteCard }) => {
  const getBankStyle = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('nubank')) return 'bg-[#8A05BE]/10 border-[#8A05BE]/30';
    if (name.includes('itaú') || name.includes('itau')) return 'bg-[#EC7000]/10 border-[#EC7000]/30';
    if (name.includes('bradesco')) return 'bg-[#CC092F]/10 border-[#CC092F]/30';
    if (name.includes('banco do brasil') || name === 'bb') return 'bg-[#FCEB00]/10 border-[#FCEB00]/30';
    if (name.includes('caixa')) return 'bg-[#005CA9]/10 border-[#005CA9]/30';
    if (name.includes('santander')) return 'bg-[#EC0000]/10 border-[#EC0000]/30';
    if (name.includes('inter')) return 'bg-[#FF7A00]/10 border-[#FF7A00]/30';
    if (name.includes('c6')) return 'bg-[#242424]/40 border-white/20';
    if (name.includes('xp')) return 'bg-[#000000]/40 border-[#FFD700]/30';
    return 'bg-white/5 border-white/10';
  };
  const [nickname, setNickname] = useState('');
  const [bank, setBank] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [brand, setBrand] = useState('');
  const [holderName, setHolderName] = useState('');
  const [dueDateType, setDueDateType] = useState<'fixed' | 'business_day'>('fixed');
  const [dueDateValue, setDueDateValue] = useState<string>('5');
  const [limit, setLimit] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editBank, setEditBank] = useState('');
  const [editLastFour, setEditLastFour] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editHolderName, setEditHolderName] = useState('');
  const [editDueDateType, setEditDueDateType] = useState<'fixed' | 'business_day'>('fixed');
  const [editDueDateValue, setEditDueDateValue] = useState<string>('5');
  const [editLimit, setEditLimit] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !bank || !dueDateValue) return;

    const newCard: Card = {
      id: uuidv4(),
      nickname,
      lastFour,
      brand,
      holderName,
      bank,
      dueDateType,
      dueDateValue: parseInt(dueDateValue, 10),
      limit: limit ? parseFloat(limit.replace(/[^0-9.,]/g, '').replace(',', '.')) : undefined,
    };

    onAddCard(newCard);
    setNickname('');
    setBank('');
    setLastFour('');
    setBrand('');
    setHolderName('');
    setDueDateType('fixed');
    setDueDateValue('5');
    setLimit('');
    setIsFormOpen(false);
  };

  const startEdit = (card: Card) => {
    setEditingId(card.id);
    setEditNickname(card.nickname);
    setEditBank(card.bank);
    setEditLastFour(card.lastFour || '');
    setEditBrand(card.brand || '');
    setEditHolderName(card.holderName || '');
    setEditDueDateType(card.dueDateType);
    setEditDueDateValue(card.dueDateValue.toString());
    setEditLimit(card.limit ? card.limit.toString() : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (card: Card) => {
    if (!editNickname || !editBank || !editDueDateValue) return;

    onUpdateCard({
      ...card,
      nickname: editNickname,
      bank: editBank,
      lastFour: editLastFour,
      brand: editBrand,
      holderName: editHolderName,
      dueDateType: editDueDateType,
      dueDateValue: parseInt(editDueDateValue, 10),
      limit: editLimit ? parseFloat(editLimit.replace(/[^0-9.,]/g, '').replace(',', '.')) : undefined,
    });
    setEditingId(null);
  };

  const cardsList = Object.values(cards);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Meus Cartões</h2>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 text-[10px] uppercase tracking-widest font-bold border border-white/10 transition-colors"
        >
          {isFormOpen ? 'Cancelar' : 'Adicionar Cartão'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Apelido (ex: Nubank Principal)</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={e => setNickname(e.target.value)} 
                required
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Banco</label>
              <input 
                type="text" 
                value={bank} 
                onChange={e => setBank(e.target.value)} 
                required
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">4 Últimos Dígitos (Opcional)</label>
              <input 
                type="text" 
                maxLength={4}
                value={lastFour} 
                onChange={e => setLastFour(e.target.value)} 
                placeholder="1234"
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Bandeira (Opcional)</label>
              <input 
                type="text" 
                value={brand} 
                onChange={e => setBrand(e.target.value)} 
                placeholder="Mastercard, Visa..."
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Titular (Opcional)</label>
              <select 
                value={holderName} 
                onChange={e => setHolderName(e.target.value)} 
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none"
              >
                <option value="">Selecione o titular...</option>
                {Object.values(people).filter(p => p.role !== 'third_party' && p.role !== 'pet').map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Limite (R$)</label>
              <input 
                type="text" 
                inputMode="decimal"
                value={limit} 
                onChange={e => setLimit(e.target.value.replace(/[^0-9.,]/g, ''))} 
                placeholder="0.00"
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tipo de Vencimento</label>
              <select 
                value={dueDateType} 
                onChange={e => setDueDateType(e.target.value as 'fixed' | 'business_day')}
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"
              >
                <option value="fixed">Dia Fixo</option>
                <option value="business_day">Dia Útil do Mês</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                {dueDateType === 'fixed' ? 'Dia do Mês (1-31)' : 'Qual dia útil? (1-20)'}
              </label>
              <input 
                type="number" 
                min="1" 
                max={dueDateType === 'fixed' ? "31" : "20"} 
                value={dueDateValue} 
                onChange={e => setDueDateValue(e.target.value)} 
                required
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors"
          >
            Salvar Cartão
          </button>
        </form>
      )}

      {cardsList.length === 0 ? (
        <div className="p-10 border border-white/10 flex flex-col items-center justify-center gap-2">
          <CreditCard className="w-8 h-8 text-white/20" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Nenhum cartão cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(cardsList as Card[]).map((card: Card) => (
            <div key={card.id} className={`p-4 flex flex-col gap-2 relative group border ${
              Object.values(people || {}).find(p => p.name === card.holderName)?.secretTheme === 'fluminense' 
                ? 'bg-gradient-to-r from-[#8A1538]/10 via-white/5 to-[#00572D]/10 border-[#8A1538]/50 shadow-[0_0_15px_rgba(138,21,56,0.1)]' 
                : getBankStyle(card.bank)
            }`}>
              {editingId === card.id ? (
                <div className="flex flex-col gap-3">
                  <input type="text" value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="Apelido" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <input type="text" value={editBank} onChange={e => setEditBank(e.target.value)} placeholder="Banco" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <div className="flex gap-2">
                    <input type="text" maxLength={4} value={editLastFour} onChange={e => setEditLastFour(e.target.value)} placeholder="4 Últimos (opcional)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                    <input type="text" value={editBrand} onChange={e => setEditBrand(e.target.value)} placeholder="Bandeira" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                  </div>
                  <select value={editHolderName} onChange={e => setEditHolderName(e.target.value)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white appearance-none">
                    <option value="">Titular (opcional)</option>
                    {Object.values(people).filter(p => p.role !== 'third_party' && p.role !== 'pet').map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input type="text" inputMode="decimal" value={editLimit} onChange={e => setEditLimit(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="Limite (R$)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                  </div>
                  <div className="flex gap-2">
                    <select value={editDueDateType} onChange={e => setEditDueDateType(e.target.value as 'fixed' | 'business_day')} className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1">
                      <option value="fixed">Dia Fixo</option>
                      <option value="business_day">Dia Útil</option>
                    </select>
                    <input type="number" min="1" value={editDueDateValue} onChange={e => setEditDueDateValue(e.target.value)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-20" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(card)} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex justify-center"><Check className="w-4 h-4" /></button>
                    <button onClick={cancelEdit} className="flex-1 p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex justify-center"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium flex items-center gap-2">
                        {card.nickname}
                        {card.lastFour && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono tracking-widest">• {card.lastFour}</span>}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{card.bank}</p>
                        {card.brand && <p className="text-[10px] text-emerald-400/80 uppercase tracking-widest">{card.brand}</p>}
                      </div>
                      {card.holderName && (() => {
  const isFluminense = Object.values(people || {}).find(p => p.name === card.holderName)?.secretTheme === 'fluminense';
  return isFluminense ? (
    <p className="text-[10px] uppercase tracking-widest mt-1">
      <span className="text-white/30">Titular: </span>
      <span className="bg-gradient-to-r from-[#8A1538]/20 via-white/10 to-[#00572D]/20 border border-[#8A1538]/50 shadow-[0_0_10px_rgba(138,21,56,0.1)] px-1.5 py-[1px] rounded text-[9px] text-white font-bold ml-1">
        {card.holderName}
      </span>
    </p>
  ) : (
    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Titular: {card.holderName}</p>
  );
})()}
                    </div>
                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(card)}
                        className="text-white/20 hover:text-white transition-colors p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteCard(card.id)}
                        className="text-white/20 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 text-xs font-mono flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400/80">Vence: {card.dueDateType === 'fixed' ? `Dia ${card.dueDateValue}` : `${card.dueDateValue}º Dia Útil`}</span>
                      <button 
                        onClick={() => onUpdateCard({...card, alertEnabled: !card.alertEnabled})}
                        className={`p-1 transition-colors ${card.alertEnabled ? 'text-amber-400' : 'text-white/20 hover:text-white/60'}`}
                        title={card.alertEnabled ? 'Alerta ativado' : 'Alerta desativado'}
                      >
                        {card.alertEnabled ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {card.limit && <span className="text-white/60">Limite: R$ {formatCurrency(card.limit)}</span>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
