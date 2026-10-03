import { DateInput } from './DateInput';
import { formatCurrency } from "../lib/format";
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Card, Person } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  categories: string[];
  transactions?: any[];
  cards?: Record<string, Card>;
  people?: Record<string, Person>;
  onAdd: (payload: Transaction | Transaction[]) => void;
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onClose?: () => void;
  userName?: string;
}

export const TransactionForm: React.FC<Props> = ({ categories, transactions = [], cards = {}, people = {}, onAdd, onAddCategory, onRemoveCategory, onClose, userName }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [paidBy, setPaidBy] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');
  const [recurrence, setRecurrence] = useState<'none' | 'fixed' | 'installments' | 'annual' | 'weekly'>('none');
  const [installmentsCount, setInstallmentsCount] = useState<string>('2');
  
  const [installmentValueStr, setInstallmentValueStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash' | ''>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [dateRule, setDateRule] = useState<'exact' | 'fixed_day' | 'business_day' | 'day_of_week'>('exact');
  const [dateRuleValue, setDateRuleValue] = useState<string>('5');
  const [interestRate, setInterestRate] = useState('');

  useEffect(() => {
    const personValues = Object.values(people) as Person[];
    if (!paidBy && personValues.length > 0) {
      setPaidBy(personValues[0].id);
    }
  }, [people, paidBy]);

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const parsedInstallments = parseInt(installmentsCount) || 1;
  const parsedInstallmentValue = installmentValueStr !== '' ? parseFloat(installmentValueStr.replace(',', '.')) : (parsedInstallments > 0 ? parsedAmount / parsedInstallments : parsedAmount);

  let previewTotal = parsedAmount;
  let previewInstallment = parsedAmount;

  if (recurrence === 'installments' && parsedInstallments > 0) {
    previewInstallment = parsedInstallmentValue;
    previewTotal = previewInstallment * parsedInstallments;
  }

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  useEffect(() => {
    if (type === 'income') {
      const incomeOptions = ["Salário", "Bônus", "Dividendos", "Dívidas", "Outros"];
      if (!category || !incomeOptions.includes(category)) {
        setCategory("Salário");
      }
    } else {
      if (!category || (categories.length > 0 && !categories.includes(category))) {
        setCategory(categories[0] || '');
      }
    }
  }, [type, categories, category]);

  const formatLocal = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const handleSubmit = (e: React.FormEvent) => {
    try {
    e.preventDefault();
    const isPaid = status === 'paid';
    if (!description || !amount || !date || !category) {
      alert("Por favor, preencha todos os campos obrigatórios (Descrição, Valor, Data e Categoria).");
      return;
    }
    if (isPaid && (!paidBy || (type === 'expense' && paymentMethod === 'credit' && !sourceId))) {
      alert("Por favor, preencha os dados de pagamento (Pagador, e Cartão se aplicável) para lançamentos pagos.");
      return;
    }

    const [year, month, day] = date.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);
    
    const transactions: Transaction[] = [];
    const batchGroupId = uuidv4();
    const occurrencesToGenerate = recurrence === 'installments' ? parsedInstallments : (recurrence === 'fixed' ? 12 : (recurrence === 'annual' ? 10 : (recurrence === 'weekly' ? 52 : 1)));
    const txAmount = recurrence === 'installments' ? previewInstallment : parsedAmount;
    
    let interestPerTx = 0;
    if (recurrence === 'installments' && parsedInstallments > 0) {
      const totalInterest = previewTotal - parsedAmount;
      if (totalInterest > 0) {
        interestPerTx = totalInterest / parsedInstallments;
      }
    }

    for (let i = 0; i < occurrencesToGenerate; i++) {
      let txDate: Date;
      let effectiveDateRule = dateRule;
      let effectiveDateRuleValue = dateRuleValue;

      if (type === 'expense' && paymentMethod === 'credit' && sourceId && cards[sourceId]) {
        if (recurrence === 'installments' || recurrence === 'fixed') {
          effectiveDateRule = cards[sourceId].dueDateType as any;
          effectiveDateRuleValue = cards[sourceId].dueDateValue.toString();
        }
      }

      if (recurrence === 'annual') {
        if (effectiveDateRule === 'exact') {
           txDate = new Date(baseDate.getFullYear() + i, baseDate.getMonth(), baseDate.getDate());
        } else {
           const targetYear = baseDate.getFullYear() + i;
           const targetMonth = baseDate.getMonth();
           if (effectiveDateRule === 'fixed_day') {
              txDate = new Date(targetYear, targetMonth, parseInt(effectiveDateRuleValue) || 1);
           } else if (effectiveDateRule === 'business_day') {
              const ruleN = parseInt(effectiveDateRuleValue) || 1;
              let day = 1;
              let businessDaysCount = 0;
              let calculatedDate = new Date(targetYear, targetMonth, 1);
              while (day <= 31) {
                const d = new Date(targetYear, targetMonth, day);
                if (d.getMonth() !== targetMonth) break;
                const dayOfWeek = d.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                  businessDaysCount++;
                  if (businessDaysCount === ruleN) {
                    calculatedDate = d;
                    break;
                  }
                }
                day++;
              }
              txDate = calculatedDate;
           } else {
              txDate = new Date(baseDate.getFullYear() + i, baseDate.getMonth(), baseDate.getDate());
           }
        }
      } else if (recurrence === 'weekly') {
        if (effectiveDateRule === 'day_of_week') {
            const targetDow = parseInt(effectiveDateRuleValue || '1');
            let d = new Date(baseDate);
            while (d.getDay() !== targetDow) {
               d.setDate(d.getDate() + 1);
            }
            d.setDate(d.getDate() + (i * 7));
            txDate = d;
        } else {
            txDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + (i * 7));
        }
      } else {
        const targetYear = baseDate.getFullYear();
        const targetMonth = baseDate.getMonth() + i;
        
        if (effectiveDateRule === 'fixed_day') {
          const ruleDay = parseInt(effectiveDateRuleValue) || 1;
          txDate = new Date(targetYear, targetMonth, ruleDay);
        } else if (effectiveDateRule === 'business_day') {
          const ruleN = parseInt(effectiveDateRuleValue) || 1;
          let day = 1;
          let businessDaysCount = 0;
          let calculatedDate = new Date(targetYear, targetMonth, 1);
          
          while (day <= 31) {
            const d = new Date(targetYear, targetMonth, day);
            if (d.getMonth() !== new Date(targetYear, targetMonth, 1).getMonth()) break;
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              businessDaysCount++;
              if (businessDaysCount === ruleN) {
                calculatedDate = d;
                break;
              }
            }
            day++;
          }
          txDate = calculatedDate;
        } else {
          txDate = new Date(targetYear, targetMonth, baseDate.getDate());
        }
      }
      
      let txDescription = description;
      if (recurrence === 'installments') {
        txDescription = `${description} (${i+1}/${parsedInstallments})`;
      } else if (recurrence === 'fixed' && i > 0) {
        txDescription = `${description} (Fixa)`;
      } else if (recurrence === 'annual' && i > 0) {
        txDescription = `${description} (Anual)`;
      } else if (recurrence === 'weekly' && i > 0) {
        txDescription = `${description} (Semanal)`;
      }

      transactions.push({
        id: uuidv4(),
        description: txDescription,
        amount: txAmount,
        date: formatLocal(isNaN(txDate.getTime()) ? new Date() : txDate),
        category,
        type,
        paidBy: status === 'paid' ? (paidBy || userName || 'Eu') : '',
        updatedAt: Date.now(),
        status: i === 0 ? status : 'pending',
        groupId: occurrencesToGenerate > 1 ? batchGroupId : undefined,
        isRecurring: recurrence !== 'none',
        paymentMethod: paymentMethod || undefined,
        sourceId: paymentMethod === 'credit' && sourceId ? sourceId : undefined,
        interestAmount: interestPerTx > 0 ? interestPerTx : undefined
      });
    }

    onAdd(transactions);

    setDescription('');
    setAmount('');
    setRecurrence('none');
    setStatus('paid');
    setInterestRate('');
    setInstallmentsCount('2');
    
    onClose?.();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    // Calculate usage
    const countA = transactions.filter(t => t.category === a).length;
    const countB = transactions.filter(t => t.category === b).length;
    
    const isOutrosA = a.toLowerCase() === 'outros';
    const isOutrosB = b.toLowerCase() === 'outros';
    if (isOutrosA && !isOutrosB) return 1;
    if (!isOutrosA && isOutrosB) return -1;
    
    if (countA !== countB) return countB - countA;
    return a.localeCompare(b);
  });

  if (showCategoryManager) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Gerenciar Categorias</h2>
          <button type="button" onClick={() => setShowCategoryManager(false)} className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest hover:text-emerald-300">
            Voltar
          </button>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newCategoryInput} 
            onChange={e => setNewCategoryInput(e.target.value)} 
            placeholder="Nova categoria..." 
            className="flex-1 bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" 
          />
          <button 
            type="button" 
            onClick={() => {
              if (newCategoryInput.trim()) {
                onAddCategory(newCategoryInput.trim());
                setNewCategoryInput('');
              }
            }} 
            className="px-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest"
          >
            Adicionar
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
          {sortedCategories.map(c => (
            <div key={c} className="flex justify-between items-center p-3 bg-white/5 border border-white/10">
              <span className="text-sm text-white flex items-center gap-2">
                <CategoryIcon category={c} petSpecies={Object.values(people || {}).find(p => p.role === "pet")?.species} className="w-4 h-4 text-emerald-400" />
                {c}
              </span>
              <button 
                type="button" 
                onClick={() => onRemoveCategory(c)} 
                className="text-[10px] text-rose-500 uppercase font-bold tracking-widest hover:text-rose-400"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Novo Lançamento</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Tipo</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setType('income')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${type === 'income' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'}`}>
              Receita
            </button>
            <button type="button" onClick={() => setType('expense')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${type === 'expense' ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}>
              Despesa
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Descrição</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Supermercado"
                 className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Valor (R$)</label>
            <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="0.00"
                   className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Data</label>
            <DateInput value={date} onChange={setDate} className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" containerClassName="w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className={`block text-[10px] uppercase font-bold ${type === 'income' ? 'text-emerald-400' : 'text-white/30'}`}>{type === 'income' ? 'Fonte da Receita' : 'Categoria'}</label>
              {type === 'expense' && status === 'paid' && (
                <button type="button" onClick={() => setShowCategoryManager(true)} className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest hover:text-emerald-300">
                  Gerenciar
                </button>
              )}
            </div>
            {type === 'income' ? (
              <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none">
                <option value="" disabled className="bg-[#050505] text-white/50">Selecione...</option>
                <option value="Salário" className="bg-[#050505] text-white">Salário</option>
                <option value="Bônus" className="bg-[#050505] text-white">Bônus</option>
                <option value="Dividendos" className="bg-[#050505] text-white">Dividendos</option>
                <option value="Dívidas" className="bg-[#050505] text-white">Dívidas</option>
                <option value="Outros" className="bg-[#050505] text-white">Outros</option>
              </select>
            ) : (
              <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none">
                <option value="" disabled className="bg-[#050505] text-white/50">Selecione a categoria...</option>
                {categories.map(c => (
                  <option key={c} value={c} className="bg-[#050505] text-white">{c}</option>
                ))}
              </select>
            )}
          </div>
          {true && (
            <div>
              <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Situação</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none">
                <option value="paid" className="bg-[#050505] text-white">Pago</option>
                <option value="pending" className="bg-[#050505] text-white">Pendente</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-1">
            <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Frequência</label>
            <select value={recurrence} onChange={e => setRecurrence(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white appearance-none">
              <option value="none" className="bg-[#050505] text-white">Único</option>
              <option value="weekly" className="bg-[#050505] text-white">Semanal</option>
              <option value="fixed" className="bg-[#050505] text-white">Mensal</option>
              <option value="annual" className="bg-[#050505] text-white">Anual</option>
              <option value="installments" className="bg-[#050505] text-white">Parcelado</option>
            </select>
          </div>
          
          {(status === 'paid') && (<div>
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
          </div>)}

          {recurrence !== 'none' && !(type === 'expense' && paymentMethod === 'credit' && recurrence === 'installments' && sourceId) && (
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-emerald-400 mb-1 font-bold">
                  {recurrence === 'weekly' ? 'Dia da Semana' : 'Vencimento Especial'}
                </label>
                {recurrence === 'weekly' ? (
                  <select value={dateRule === 'day_of_week' ? dateRuleValue : ''} onChange={e => { setDateRule('day_of_week' as any); setDateRuleValue(e.target.value); }}
                          className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-emerald-400 appearance-none">
                    <option value="" disabled className="bg-[#050505] text-white/50">Selecione...</option>
                    <option value="1" className="bg-[#050505] text-white">Segunda-feira</option>
                    <option value="2" className="bg-[#050505] text-white">Terça-feira</option>
                    <option value="3" className="bg-[#050505] text-white">Quarta-feira</option>
                    <option value="4" className="bg-[#050505] text-white">Quinta-feira</option>
                    <option value="5" className="bg-[#050505] text-white">Sexta-feira</option>
                    <option value="6" className="bg-[#050505] text-white">Sábado</option>
                    <option value="0" className="bg-[#050505] text-white">Domingo</option>
                  </select>
                ) : (
                  <select value={dateRule} onChange={e => { setDateRule(e.target.value as any); setDateRuleValue('1'); }}
                          className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-emerald-400 appearance-none">
                    <option value="exact" className="bg-[#050505] text-white">Data exata (Calendário)</option>
                    {recurrence !== 'annual' && <option value="fixed_day" className="bg-[#050505] text-white">Dia Fixo do Mês</option>}
                    <option value="business_day" className="bg-[#050505] text-white">Dia Útil do Mês</option>
                  </select>
                )}
              </div>
              <div className="col-span-1 md:col-span-1">
                {recurrence !== 'weekly' && dateRule !== 'exact' && (
                  <>
                    <label className="block text-[10px] uppercase text-emerald-400 mb-1 font-bold">
                      {dateRule === 'fixed_day' ? 'Qual Dia do Mês?' : 'Qual Dia Útil do Mês?'}
                    </label>
                    <input type="number" min="1" max={dateRule === 'fixed_day' ? "31" : "20"} 
                           value={dateRuleValue} onChange={e => setDateRuleValue(e.target.value)}
                           className="w-full bg-[#050505] border border-emerald-500/30 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" />
                  </>
                )}
              </div>
            </div>
          )}

          {type === 'expense' && status === 'paid' && (
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          )}
        </div>

        {recurrence === 'installments' && (
          <div className="bg-white/[0.02] border border-white/10 p-4 flex flex-col gap-4">
            <h3 className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest">Configuração de Parcelas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Qtd. Parcelas</label>
                <input type="number" min="2" max="120" value={installmentsCount} onChange={e => setInstallmentsCount(e.target.value)}
                       className="w-full bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-white/30 mb-1 font-bold">Valor da Parcela (R$)</label>
                <input type="text" inputMode="decimal" value={installmentValueStr} onChange={e => setInstallmentValueStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                       placeholder={parsedInstallments > 0 ? formatCurrency(parsedAmount / parsedInstallments) : '0,00'}
                       className="w-full bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white" />
              </div>
            </div>
            {(parsedInstallmentValue * parsedInstallments) > parsedAmount && (
              <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1">
                <div className="text-xs text-white/60 flex justify-between">
                  <span>Total a pagar:</span>
                  <span className="text-white font-medium">R$ {formatCurrency(parsedInstallmentValue * parsedInstallments)}</span>
                </div>
                <div className="text-xs text-rose-400 flex justify-between">
                  <span>Juros total calculado:</span>
                  <span className="font-bold">R$ {formatCurrency((parsedInstallmentValue * parsedInstallments) - parsedAmount)}</span>
                </div>
              </div>
            )}
            {(parsedInstallmentValue * parsedInstallments) < parsedAmount && installmentValueStr !== '' && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1">
                <div className="text-xs text-amber-400 flex justify-between">
                  <span>Atenção:</span>
                  <span>O valor das parcelas é menor que o original.</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black p-4 text-xs font-bold uppercase tracking-widest mt-2 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          Adicionar Lançamento
        </button>
      </form>
    </div>
  );
};
