import { formatCurrency } from "../lib/format";
import React, { useState, useMemo } from 'react';
import { Target, TrendingDown, Edit2, Check, X, AlertTriangle, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  people?: Record<string, any>;
  transactions: Transaction[];
  categories: string[];
  budgets: Record<string, number>;
  onUpdateBudget: (category: string, amount: number) => void;
  currentMonth: string; // YYYY-MM
  onAddCategory?: (category: string) => void;
}


const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#14b8a6', '#f43f5e', '#a855f7'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} opacity={0.7} className="font-mono">
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

export const PlanningManager: React.FC<Props> = ({ transactions, categories, budgets, onUpdateBudget, currentMonth, onAddCategory, people = {} }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(() => JSON.parse(localStorage.getItem('hiddenCategories') || '[]'));
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const toggleVisibility = (category: string) => {
    setHiddenCategories(prev => {
      const newHidden = prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category];
      localStorage.setItem('hiddenCategories', JSON.stringify(newHidden));
      return newHidden;
    });
  };

  const [editAmount, setEditAmount] = useState<string>('');

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setEditAmount((budgets[category] || 0).toString());
  };

  const saveEdit = (category: string) => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount >= 0) {
      onUpdateBudget(category, amount);
    }
    setEditingCategory(null);
  };

  // Calculate spent amounts for the current month per category
  const categorySpending = useMemo(() => {
    const spent: Record<string, number> = {};
    categories.forEach(c => spent[c] = 0);

    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date && typeof tx.date === 'string' && tx.date.startsWith(currentMonth)) {
        if (spent[tx.category] !== undefined) {
          spent[tx.category] += tx.amount;
        }
      }
    });
    return spent;
  }, [transactions, categories, currentMonth]);



  const [newCategoryName, setNewCategoryName] = useState('');
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() && onAddCategory && !categories.includes(newCategoryName.trim())) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const sortedCategoriesList = useMemo(() => {
    return [...categories].sort((a, b) => {
      const spentA = categorySpending[a] || 0;
      const spentB = categorySpending[b] || 0;
      return spentB - spentA;
    });
  }, [categories, categorySpending]);


  const pieData = useMemo(() => {
    return Object.entries(categorySpending)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [categorySpending]);

  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    let colorIndex = 0;
    
    // First assign colors to those in pieData to match the chart exactly
    pieData.forEach((entry) => {
      colors[entry.name] = COLORS[colorIndex % COLORS.length];
      colorIndex++;
    });
    
    // Then assign colors to the remaining categories
    sortedCategoriesList.forEach((cat) => {
      if (!colors[cat]) {
        colors[cat] = COLORS[colorIndex % COLORS.length];
        colorIndex++;
      }
    });
    
    return colors;
  }, [pieData, sortedCategoriesList]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm uppercase tracking-widest font-bold text-white/60">Planejamento Mensal</h2>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest hidden md:inline">Ocultar/Exibir</span>
          </button>
          
          {showVisibilityMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded shadow-xl z-50 p-2 flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar">
              <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest p-2 border-b border-white/5 mb-1">Visibilidade das Categorias</div>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => toggleVisibility(cat)}
                  className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors text-left"
                >
                  <span className={`text-xs flex items-center gap-2 ${hiddenCategories.includes(cat) ? 'text-white/30 line-through' : 'text-white/80'}`}>
                    <CategoryIcon category={cat} petSpecies={Object.values(people || {}).find(p => p.role === "pet")?.species} className="w-3 h-3 text-inherit" />
                    {cat}
                  </span>
                  {hiddenCategories.includes(cat) ? <EyeOff className="w-3 h-3 text-white/30" /> : <Eye className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      
      <p className="text-xs text-white/40 mb-4">Estipule um limite de gastos para o mês e acompanhe o quanto você já usou.</p>

      {pieData.length > 0 && (
        <div className="p-4 bg-white/5 border border-white/10 mb-2 flex flex-col items-start w-full">
          <h3 className="text-[10px] uppercase text-white/50 tracking-widest font-bold mb-4 w-full text-center">Divisão de Gastos</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="35%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `R$ ${formatCurrency(value)}`}
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right" 
                  wrapperStyle={{ fontSize: '11px', color: '#fff', opacity: 0.8, paddingRight: '20px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCategoriesList.filter(c => !hiddenCategories.includes(c)).map(category => {
          const budget = budgets[category] || 0;
          const spent = categorySpending[category] || 0;
          const isOverBudget = budget > 0 && spent > budget;
          const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

          return (
            <div key={category} className="p-4 bg-white/5 border border-white/10 flex flex-col gap-3 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                <h3 className="text-white font-medium uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <CategoryIcon category={category} petSpecies={Object.values(people || {}).find(p => p.role === "pet")?.species} className="w-3 h-3 text-white/50" />
                  {categoryColors[category] && (
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: categoryColors[category] }}></span>
                  )}
                  {category}
                  {isOverBudget && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                </h3>
                {editingCategory !== category && (
                  <button onClick={() => startEdit(category)} className="text-white/20 hover:text-white transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {editingCategory === category ? (
                <div className="flex gap-2 relative z-10">
                  <input 
                    type="number" 
                    value={editAmount} 
                    onChange={e => setEditAmount(e.target.value)} 
                    placeholder="Limite (R$)"
                    className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1"
                  />
                  <button onClick={() => saveEdit(category)} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingCategory(null)} className="p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Gasto Atual</p>
                      <p className={`text-lg font-light ${isOverBudget ? 'text-rose-400' : 'text-white'}`}>R$ {formatCurrency(spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Limite</p>
                      <p className="text-sm font-medium text-white/60">
                        {budget > 0 ? `R$ ${formatCurrency(budget)}` : 'Não definido'}
                      </p>
                    </div>
                  </div>

                  {budget > 0 && (
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : (progress > 80 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                  {budget > 0 && (
                    <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest mt-1">
                      <span>{progress.toFixed(0)}% utilizado</span>
                      {isOverBudget ? (
                        <span className="text-rose-400 font-bold">+ R$ {formatCurrency(spent - budget)} extra</span>
                      ) : (
                        <span>R$ {formatCurrency(budget - spent)} restante</span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Subtle background glow based on status */}
              {budget > 0 && progress >= 80 && !isOverBudget && (
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl z-0 pointer-events-none"></div>
              )}
              {budget > 0 && isOverBudget && (
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl z-0 pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-white/5 pt-8">
        <h3 className="text-[10px] uppercase text-white/50 tracking-widest font-bold mb-4">Adicionar categoria personalizada</h3>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input 
            type="text" 
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="Nome da categoria"
            className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1 focus:outline-none focus:border-emerald-500/50"
          />
          <button type="submit" disabled={!newCategoryName.trim() || !onAddCategory} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors px-4 text-sm font-medium disabled:opacity-50">
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
};

