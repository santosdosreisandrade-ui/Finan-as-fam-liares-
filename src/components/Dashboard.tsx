import { formatCurrency } from "../lib/format";

import React from 'react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  previousBalance?: number;
}

export const Dashboard: React.FC<Props> = ({ transactions, previousBalance = 0 }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const { income, expense, futureIncome, futureExpense } = transactions.reduce(
    (acc, curr) => {
      const isFuture = (curr.date && curr.date > todayStr) || curr.status === 'pending';
      
      if (curr.type === 'income') {
        if (isFuture) acc.futureIncome += curr.amount;
        else acc.income += curr.amount;
      } else {
        if (isFuture) acc.futureExpense += curr.amount;
        else acc.expense += curr.amount;
      }
      return acc;
    },
    { income: 0, expense: 0, futureIncome: 0, futureExpense: 0 }
  );

  const finalBalance = previousBalance + income - expense;
  const projectedBalance = finalBalance + futureIncome - futureExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-1">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Saldo Anterior</h3>
        <p className={`text-2xl font-light tracking-tighter ${previousBalance > 0 ? 'text-emerald-400' : previousBalance < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
          R$ {formatCurrency(previousBalance)}
        </p>
      </div>
      <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-1 relative overflow-hidden">
        <h3 className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Receitas</h3>
        <p className="text-2xl font-light tracking-tighter text-emerald-400">
          R$ {formatCurrency(income)}
        </p>
        {futureIncome > 0 && (
          <p className="text-[10px] text-emerald-400 mt-1 uppercase tracking-widest">+ R$ {formatCurrency(futureIncome)} previsto/pendente</p>
        )}
        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-emerald-500/5 rounded-full"></div>
      </div>
      <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-1">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Despesas</h3>
        <p className="text-2xl font-light tracking-tighter text-rose-400">
          R$ {formatCurrency(expense)}
        </p>
        {futureExpense > 0 && (
          <p className="text-[10px] text-rose-400 mt-1 uppercase tracking-widest">+ R$ {formatCurrency(futureExpense)} previsto/pendente</p>
        )}
      </div>
      <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-1">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Saldo Atual</h3>
        <p className={`text-2xl font-bold tracking-tighter ${finalBalance > 0 ? 'text-emerald-400' : finalBalance < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
          R$ {formatCurrency(finalBalance)}
        </p>
        {(futureIncome > 0 || futureExpense > 0) && (
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
            Projeção final: R$ {formatCurrency(projectedBalance)}
          </p>
        )}
      </div>
    </div>
  );
};
