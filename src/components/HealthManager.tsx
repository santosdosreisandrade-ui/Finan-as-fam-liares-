import { formatCurrency } from "../lib/format";
import React, { useState, useMemo } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Transaction, Card, Person } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface Props {
  transactions: Transaction[];
  cards: Record<string, Card>;
  people: Record<string, Person>;
}

const COLORS = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export const HealthManager: React.FC<Props> = ({ transactions, cards, people }) => {

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505] border border-white/10 p-3 shadow-xl">
          <p className="text-white text-xs font-medium mb-1">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-emerald-400 font-mono text-sm">
            R$ {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Simple Monthly Data Check
  const { chartDataCategory, chartDataPaymentMethod, interestData, monthlyData, lastMonthTotal, currentMonthTotal } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const expenses = transactions.filter(t => t.type === 'expense' && !t.deleted);

    // Current Month Category Breakdown
    const currentMonthExpenses = expenses.filter(t => {
       const d = new Date(t.date + 'T12:00:00Z');
       return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const byCategory = currentMonthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const chartDataCategory = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Current Month Payment Method Breakdown
    const byPaymentMethod = currentMonthExpenses.reduce((acc, t) => {
      const pm = t.paymentMethod === 'credit' ? 'Crédito' :
                 t.paymentMethod === 'debit' ? 'Débito' :
                 t.paymentMethod === 'cash' ? 'Dinheiro' :
                 t.paymentMethod === 'pix' ? 'PIX' : 'Não Informado';
      acc[pm] = (acc[pm] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const chartDataPaymentMethod = Object.entries(byPaymentMethod)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Yearly Bar Chart and Interest Data
    const monthlyStats: Record<string, number> = {};
    const interestStats: Record<string, number> = {};
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[key] = 0;
      interestStats[key] = 0;
    }

    expenses.forEach(tx => {
      if (!tx.date) return;
      const key = tx.date.substring(0, 7); // YYYY-MM
      if (monthlyStats[key] !== undefined) {
        monthlyStats[key] += tx.amount;
      }
      if (interestStats[key] !== undefined && tx.interestAmount) {
        interestStats[key] += tx.interestAmount;
      }
    });

    const monthlyData = Object.entries(monthlyStats).map(([name, value]) => ({ name, value }));
    const interestData = Object.entries(interestStats).map(([name, value]) => ({ name, value }));

    // Comparative
    let currentMonthT = 0;
    let lastMonthT = 0;

    expenses.forEach(t => {
      const d = new Date(t.date + 'T12:00:00Z');
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        currentMonthT += t.amount;
      }
      if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth) {
        lastMonthT += t.amount;
      }
    });

    return { chartDataCategory, chartDataPaymentMethod, interestData, monthlyData, currentMonthTotal: currentMonthT, lastMonthTotal: lastMonthT };
  }, [transactions]);

  const percentageChange = lastMonthTotal > 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Análise de Dados</h3>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold text-center">Gasto por Categoria (Este Mês)</h4>
            {chartDataCategory.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataCategory}
                      cx="35%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartDataCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="h-[250px] flex items-center justify-center text-xs text-white/30 font-bold uppercase">Nenhum gasto este mês</div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold text-center">Forma de Pagamento (Este Mês)</h4>
            {chartDataPaymentMethod.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataPaymentMethod}
                      cx="35%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartDataPaymentMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="h-[250px] flex items-center justify-center text-xs text-white/30 font-bold uppercase">Nenhum gasto este mês</div>
            )}
          </div>

          <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-6 text-center justify-center">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Comparativo Mensal</h4>
            <div className={`p-2 border text-xs font-bold uppercase tracking-widest inline-block mx-auto mb-4 ${percentageChange > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              {percentageChange > 0 ? '▲ Aumento' : '▼ Redução'} de {Math.abs(percentageChange).toFixed(1)}%
            </div>
            
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Mês Passado', value: lastMonthTotal },
                  { name: 'Este Mês', value: currentMonthTotal }
                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    <Cell fill="#64748b" />
                    <Cell fill={percentageChange > 0 ? "#f43f5e" : "#10b981"} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Gastos Anuais (Últimos 12 meses)</h3>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => {
                    const [y, m] = val.split('-');
                    return `${m}/${y.substring(2)}`;
                  }}
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`}
                />
                <Tooltip cursor={{ fill: '#ffffff05' }} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rose-400">Juros Pagos (Últimos 12 meses)</h3>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => {
                    const [y, m] = val.split('-');
                    return `${m}/${y.substring(2)}`;
                  }}
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`}
                />
                <Tooltip cursor={{ fill: '#ffffff05' }} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};