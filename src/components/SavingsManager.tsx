import { DateInput } from './DateInput';
import { formatCurrency } from "../lib/format";
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import { Vault, Plus, Trash2, Edit2, Check, X, TrendingUp, PiggyBank, Calendar } from 'lucide-react';
import { showNotification, requestNotificationPermission } from '../lib/notifications';
import { Savings, Person } from '../types';

interface Props {
  savings: Record<string, Savings>;
  people?: Record<string, Person>;
  onSave: (savings: Savings) => void;
  onDelete: (id: string) => void;
}


const getBankColor = (bankName: string) => {
  const name = bankName.toLowerCase();
  if (name.includes('nubank') || name.includes('nuinvest')) return 'bg-purple-900/40 border-purple-500/50';
  if (name.includes('inter')) return 'bg-orange-900/40 border-orange-500/50';
  if (name.includes('itaú') || name.includes('itau')) return 'bg-orange-600/40 border-blue-500/50';
  if (name.includes('bradesco')) return 'bg-red-900/40 border-red-500/50';
  if (name.includes('santander')) return 'bg-red-800/40 border-red-600/50';
  if (name.includes('banco do brasil') || name.includes('bb ')) return 'bg-yellow-900/40 border-blue-500/50';
  if (name.includes('caixa')) return 'bg-blue-900/40 border-orange-500/50';
  if (name.includes('xp ')) return 'bg-zinc-800/80 border-yellow-500/50';
  if (name.includes('btg')) return 'bg-blue-900/40 border-blue-400/50';
  if (name.includes('c6')) return 'bg-zinc-900/80 border-zinc-500/50';
  if (name.includes('clear')) return 'bg-blue-900/40 border-blue-500/50';
  if (name.includes('rico')) return 'bg-orange-900/40 border-orange-500/50';
  return 'bg-white/[0.02] border-white/5 hover:border-white/10';
};

export const SavingsManager: React.FC<Props> = ({ savings, people = {}, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState<'savings' | 'stock'>('savings');
  const [applicationType, setApplicationType] = useState<'porquinho' | 'tesouro' | 'renda_fixa' | 'acoes' | 'outras'>('porquinho');
  const [notifyUpdate, setNotifyUpdate] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestPeriod, setInterestPeriod] = useState<'monthly' | 'annual'>('annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [maturityDate, setMaturityDate] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBank, setEditBank] = useState('');
  const [editType, setEditType] = useState<'savings' | 'stock'>('savings');
  const [editApplicationType, setEditApplicationType] = useState<'porquinho' | 'tesouro' | 'renda_fixa' | 'acoes' | 'outras'>('porquinho');
  const [editNotifyUpdate, setEditNotifyUpdate] = useState(false);
  const [editInitialAmount, setEditInitialAmount] = useState('');
  const [editInterestRate, setEditInterestRate] = useState('');
  const [editInterestPeriod, setEditInterestPeriod] = useState<'monthly' | 'annual'>('annual');
  const [editStartDate, setEditStartDate] = useState('');
  const [editMaturityDate, setEditMaturityDate] = useState('');
  const [editOwnerId, setEditOwnerId] = useState('');
  const [addingDividendTo, setAddingDividendTo] = useState<string | null>(null);
  const [dividendAmount, setDividendAmount] = useState('');
  const [dividendDate, setDividendDate] = useState('');
  
  
  const familyMembers = Object.values(people).filter(p => p.role === 'family');

  const handleAddDividend = (e: React.FormEvent, saving: Savings) => {
    e.preventDefault();
    const newDividend = {
      id: crypto.randomUUID(),
      amount: parseFloat(dividendAmount),
      date: dividendDate
    };
    const updatedSaving = {
      ...saving,
      dividends: [...(saving.dividends || []), newDividend]
    };
    onSave(updatedSaving);
    setAddingDividendTo(null);
    setDividendAmount('');
    setDividendDate('');
  };


  const calculateCurrentValue = (saving: Savings) => {
    const start = new Date(saving.startDate).getTime();
    const now = new Date().getTime();
    const elapsedDays = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
    
    let dailyRate = 0;
    if (saving.interestPeriod === 'monthly') {
      dailyRate = Math.pow(1 + saving.interestRate / 100, 1 / 30) - 1;
    } else {
      dailyRate = Math.pow(1 + saving.interestRate / 100, 1 / 365) - 1;
    }

    return saving.initialAmount * Math.pow(1 + dailyRate, elapsedDays);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank || !initialAmount || !startDate || (applicationType !== 'porquinho' && !interestRate)) return;

    onSave({
      id: uuidv4(),
      name,
      bank,
      initialAmount: parseFloat(initialAmount),
      interestRate: applicationType === 'porquinho' ? 0 : parseFloat(interestRate),
      interestPeriod,
      startDate,
      maturityDate: maturityDate || undefined,
      // updatedAt: new Date().toISOString()
    });

    setBank('');
    setInitialAmount('');
    setInterestRate('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setMaturityDate('');
    setApplicationType('porquinho');
    setNotifyUpdate(false);
    setIsAdding(false);
  };

  const startEdit = (saving: Savings) => {
    setEditingId(saving.id);
    setEditName(saving.name || '');
    setEditBank(saving.bank);
    setEditType(saving.type || 'savings');
    setEditApplicationType(saving.applicationType || 'porquinho');
    setEditNotifyUpdate(saving.notifyUpdate || false);
    setEditInitialAmount(saving.initialAmount.toString());
    setEditInterestRate(saving.interestRate.toString());
    setEditInterestPeriod(saving.interestPeriod);
    setEditStartDate(saving.startDate);
    setEditMaturityDate(saving.maturityDate || '');
    setEditOwnerId(saving.ownerId || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (saving: Savings) => {
    if (!editBank || !editInitialAmount || !editStartDate || (editApplicationType !== 'porquinho' && !editInterestRate)) return;

    onSave({
      ...saving,
      name: editName,
      bank: editBank,
      type: editType,
      initialAmount: parseFloat(editInitialAmount),
      interestRate: editApplicationType === 'porquinho' ? 0 : parseFloat(editInterestRate),
      interestPeriod: editInterestPeriod,
      applicationType: editApplicationType,
      notifyUpdate: editNotifyUpdate,
      ownerId: editOwnerId,
      startDate: editStartDate,
      maturityDate: editMaturityDate || undefined,
      // updatedAt: new Date().toISOString()
    });

    setEditingId(null);
  };

  const savingsList = Object.values(savings) as Savings[];
  const totalInitial = savingsList.reduce((acc, curr) => acc + curr.initialAmount, 0);
  const totalCurrentValue = savingsList.reduce((acc, curr) => acc + calculateCurrentValue(curr), 0);
  const totalProfit = totalCurrentValue - totalInitial;

  useEffect(() => {
    if (!("Notification" in window)) return;
    
    const checkAndNotify = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await requestNotificationPermission();
      }

      if (permission === "granted") {
        // Prevent spamming if we already notified today
        const lastNotified = localStorage.getItem('lastSavingsNotification');
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastNotified === todayStr) return;

        const todayDate = new Date().getUTCDate();
        const savingsToNotify = Object.values(savings).filter(s => {
          if (s.applicationType === 'porquinho' && s.notifyUpdate && s.startDate) {
            const startDay = new Date(s.startDate).getUTCDate();
            return todayDate === startDay;
          }
          return false;
        });

        if (savingsToNotify.length > 0) {
          const names = savingsToNotify.map(s => s.name || s.bank).join(', ');
          showNotification("Atualizar Saldo (Porquinho)", {
            body: `É dia de atualizar o saldo das reservas: ${names}`,
          });
          localStorage.setItem('lastSavingsNotification', todayStr);
        }
      }
    };

    checkAndNotify();
  }, [savings]);


  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/50">
            <PiggyBank className="w-4 h-4" />
            <h3 className="text-[10px] uppercase tracking-widest font-bold">Total Aplicado</h3>
          </div>
          <p className="text-2xl font-light text-white">R$ {formatCurrency(totalInitial)}</p>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/50">
            <Vault className="w-4 h-4" />
            <h3 className="text-[10px] uppercase tracking-widest font-bold">Saldo Atualizado</h3>
          </div>
          <p className="text-2xl font-light text-white">R$ {formatCurrency(totalCurrentValue)}</p>
        </div>
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400/80">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-[10px] uppercase tracking-widest font-bold">Rendimento Bruto</h3>
          </div>
          <p className="text-2xl font-light text-emerald-400">R$ {formatCurrency(totalProfit)}</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h2 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Suas Aplicações</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] uppercase tracking-widest font-bold transition-colors"
        >
          {isAdding ? 'Cancelar' : <><Plus className="w-3 h-3" /> Nova Aplicação</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nome da Reserva</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" placeholder="ex: Viagem" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Seguradora / Banco</label>
              <input type="text" value={bank} onChange={e => setBank(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" placeholder="ex: Nubank, Inter" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Valor Aplicado (R$)</label>
              <input type="text" inputMode="decimal" value={initialAmount} onChange={e => setInitialAmount(e.target.value.replace(/[^0-9.,]/g, ''))} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tipo de Aplicação</label>
              <select value={applicationType} onChange={e => setApplicationType(e.target.value as any)} className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full">
                
                <option value="porquinho">Porquinho</option>
                <option value="tesouro">Tesouro Direto</option>
                <option value="renda_fixa">Renda Fixa</option>
                <option value="acoes">Ações</option>
                <option value="outras">Outras</option>

              </select>
            </div>
            
            {applicationType === 'porquinho' ? (
              <div className="flex flex-col gap-1 justify-center h-full pt-4">
                <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
                  <input type="checkbox" checked={notifyUpdate} onChange={e => setNotifyUpdate(e.target.checked)} className="accent-emerald-500" /> 
                  Notificar para atualizar saldo mensalmente
                </label>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Taxa de Juros (%)</label>
                <div className="flex">
                  <input type="text" inputMode="decimal" value={interestRate} onChange={e => setInterestRate(e.target.value.replace(/[^0-9.,]/g, ''))} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" placeholder="ex: 10.5" />
                  <select value={interestPeriod} onChange={e => setInterestPeriod(e.target.value as 'monthly' | 'annual')} className="bg-[#050505] border-y border-r border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                    <option value="annual">a.a.</option>
                    <option value="monthly">a.m.</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Data de Início</label>
              <DateInput value={startDate} onChange={setStartDate} containerClassName="w-full"  required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"  />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Titular</label>
              <select value={ownerId} onChange={e => setOwnerId(e.target.value)} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white">
                <option value="">Selecione...</option>
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Vencimento / Retirada (Opcional)</label>
              <DateInput value={maturityDate} onChange={setMaturityDate} containerClassName="w-full"  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white"  />
            </div>
          </div>
          <button type="submit" className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors">
            Salvar Aplicação
          </button>
        </form>
      )}

      {savingsList.length === 0 && !isAdding && (
        <div className="text-center py-12 text-white/40 border border-white/5 bg-white/[0.02]">
          Nenhuma cofre ou aplicação registrada.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsList.map((saving) => {
          const totalDividends = saving.dividends?.reduce((acc, d: any) => acc + d.amount, 0) || 0;
          const currentVal = calculateCurrentValue(saving) + totalDividends;
          
          if (editingId === saving.id) {
            return (
              <div key={saving.id} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4 relative">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    
                    <div className="flex flex-col gap-2 flex-1">
  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white w-full" placeholder="Nome" />
  <input type="text" value={editBank} onChange={e => setEditBank(e.target.value)} placeholder="Seguradora/Banco" className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-full" />
</div>
                  </div>
                  <div className="flex gap-2">
                    <select value={editApplicationType} onChange={e => setEditApplicationType(e.target.value as any)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-32">
                      
                <option value="porquinho">Porquinho</option>
                <option value="tesouro">Tesouro Direto</option>
                <option value="renda_fixa">Renda Fixa</option>
                <option value="acoes">Ações</option>
                <option value="outras">Outras</option>

                    </select>
                    <input type="number" step="0.01" value={editInitialAmount} onChange={e => setEditInitialAmount(e.target.value)} placeholder="Aplicado (R$)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                  </div>
                  {editApplicationType === 'porquinho' ? (
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer p-2">
                        <input type="checkbox" checked={editNotifyUpdate} onChange={e => setEditNotifyUpdate(e.target.checked)} className="accent-emerald-500" /> 
                        Notificar atualização de saldo mensalmente
                      </label>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="number" step="0.01" value={editInterestRate} onChange={e => setEditInterestRate(e.target.value)} placeholder="Juros (%)" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
                      <select value={editInterestPeriod} onChange={e => setEditInterestPeriod(e.target.value as 'monthly' | 'annual')} className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-20">
                        <option value="annual">a.a.</option>
                        <option value="monthly">a.m.</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <select value={editOwnerId} onChange={e => setEditOwnerId(e.target.value)} required className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1">
                      <option value="">Selecione o Titular...</option>
                      {familyMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <DateInput value={editStartDate} onChange={setEditStartDate} containerClassName="w-full flex-1"  className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1 text-[11px]" title="Início"  />
                    <DateInput value={editMaturityDate} onChange={setEditMaturityDate} containerClassName="w-full flex-1"  className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1 text-[11px]" title="Vencimento"  />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveEdit(saving)} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex justify-center"><Check className="w-4 h-4" /></button>
                    <button onClick={cancelEdit} className="flex-1 p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex justify-center"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={saving.id} className={`p-6 ${getBankColor(saving.bank)} transition-colors flex flex-col gap-4 group`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                    {saving.applicationType === 'porquinho' ? <PiggyBank className="w-4 h-4 text-white/80" /> : 
                     (saving.applicationType === 'acoes' || saving.type === 'stock') ? <TrendingUp className="w-4 h-4 text-white/80" /> : 
                     <Vault className="w-4 h-4 text-white/80" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      {saving.name || saving.bank} <span className="text-white/40 text-[10px]">({saving.bank})</span> 
                      {(saving.applicationType === 'acoes' || saving.type === 'stock') && <span className="text-[10px] ml-2 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">Ações</span>}
                      {saving.applicationType === 'porquinho' && <span className="text-[10px] ml-2 text-fuchsia-400 border border-fuchsia-500/30 px-1.5 py-0.5 rounded">Porquinho</span>}
                      {saving.applicationType === 'tesouro' && <span className="text-[10px] ml-2 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">Tesouro Direto</span>}
                      {saving.applicationType === 'renda_fixa' && <span className="text-[10px] ml-2 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">Renda Fixa</span>}
                    </h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">
                      {(saving.applicationType === 'acoes' || saving.type === 'stock') ? 'Renda Variável' : (saving.applicationType === 'porquinho' ? 'Sem Rendimento Automático' : `${saving.interestRate}% ${saving.interestPeriod === 'annual' ? 'a.a.' : 'a.m.'}`)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(saving)}
                    className="text-white/40 hover:text-white p-1 transition-colors"
                    title="Editar Aplicação"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(saving.id)}
                    className="text-rose-500/50 hover:text-rose-400 p-1 transition-colors"
                    title="Excluir Aplicação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Aplicado</p>
                  <p className="text-lg font-light text-white">R$ {formatCurrency(saving.initialAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Atualizado</p>
                  <p className="text-lg font-light text-emerald-400">R$ {formatCurrency(currentVal)}</p>
                </div>

              </div>
              
              {saving.ownerId && (
                <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    Titular: {people[saving.ownerId]?.name || 'Desconhecido'}
                  </div>
                </div>
              )}
              
              {(saving.applicationType === 'acoes' || saving.type === 'stock') && (

                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Dividendos: R$ {formatCurrency(totalDividends)}</span>
                    <button onClick={() => setAddingDividendTo(addingDividendTo === saving.id ? null : saving.id)} className="text-[10px] uppercase text-emerald-400 hover:text-emerald-300 font-bold p-1 bg-white/5 rounded">
                      + Dividendo
                    </button>
                  </div>
                  {addingDividendTo === saving.id && (
                    <form onSubmit={(e) => handleAddDividend(e, saving)} className="flex gap-2 items-center bg-[#050505] p-2 border border-white/10 rounded mt-1">
                      <input type="number" step="0.01" value={dividendAmount} onChange={e => setDividendAmount(e.target.value)} required placeholder="Valor (R$)" className="bg-transparent text-sm text-white outline-none w-24 border-r border-white/10 pr-2" />
                      <DateInput value={dividendDate} onChange={setDividendDate} containerClassName="w-full flex-1"  required className="bg-transparent text-[11px] text-white outline-none flex-1 [color-scheme:dark]"  />
                      <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-1"><Check className="w-4 h-4" /></button>
                    </form>
                  )}
                  {saving.dividends && saving.dividends.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1 max-h-24 overflow-y-auto pr-1">
                      {(saving.dividends || []).map((d: any) => (
                        <div key={d.id} className="flex justify-between items-center text-[10px] text-white/40 bg-white/5 p-1 px-2 rounded">
                          <span>{(d.date ? new Date(d.date).toLocaleDateString('pt-BR') : '')}</span>
                          <span className="text-emerald-400/80">+ R$ {formatCurrency(d.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Início: {(saving.startDate ? new Date(saving.startDate).toLocaleDateString('pt-BR') : '')}
                </div>
                {saving.maturityDate && (
                  <div className="flex items-center gap-1.5 text-amber-500/70">
                    Retirada: {(saving.maturityDate ? new Date(saving.maturityDate).toLocaleDateString('pt-BR') : '')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
