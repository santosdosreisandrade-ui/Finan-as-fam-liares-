import { LocalData, Transaction } from '../types';

const DEFAULT_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Luz', 'Água', 'Gás', 'Streaming', 'Presente', 'Criança', 'Delivery', 'Outros'];

export const getRemoteData = async (): Promise<LocalData> => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Failed to fetch data');
    
    let parsed = await res.json() as LocalData;
    if (!parsed || typeof parsed !== 'object') parsed = { transactions: {}, categories: DEFAULT_CATEGORIES };
    
    if (!parsed.transactions) parsed.transactions = {};
    else {
      // Migrate 'Veículo' to 'Transporte'
      Object.values(parsed.transactions).forEach(tx => {
        if (tx.category === 'Veículo') tx.category = 'Transporte';
      });
    }

    if (!parsed.categories) {
      parsed.categories = DEFAULT_CATEGORIES;
    } else {
      let mergedCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...(Array.isArray(parsed.categories) ? parsed.categories : [])]));
      mergedCategories = mergedCategories.filter(c => c !== 'Veículo');
      parsed.categories = mergedCategories;
    }
    
    // Save to local backup just in case we go offline
    localStorage.setItem('fintrack_local_backup', JSON.stringify(parsed));
    return parsed;
  } catch (e) {
    console.error('Failed to parse remote data, falling back to local storage backup', e);
    const localBackup = localStorage.getItem('fintrack_local_backup');
    if (localBackup) {
      try {
        return JSON.parse(localBackup);
      } catch (err) {
        console.error('Failed to parse local backup', err);
      }
    }
    return { transactions: {}, categories: DEFAULT_CATEGORIES };
  }
};

export const setRemoteData = async (data: LocalData): Promise<void> => {
  try {
    localStorage.setItem('fintrack_local_backup', JSON.stringify(data));
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save data to cloud');
  } catch (e) {
    console.error('Failed to save remote data, saved locally instead', e);
    // You might want to flag that there's pending sync data here
  }
};

export const getActiveTransactions = (data: LocalData, currentMonth?: string): Transaction[] => {
  const active: Transaction[] = [];
  
  if (!data || !data.transactions) return active;

  Object.values(data.transactions).forEach((tx) => {
    if (tx.deleted) return;

    if (!tx.recurrence || tx.recurrence === 'none') {
      active.push(tx);
      return;
    }

    
    const [yStr, mStr, dStr] = tx.date.split('-');
    let year = parseInt(yStr, 10);
    let month = parseInt(mStr, 10);
    let day = parseInt(dStr, 10);

    let occurrences = 1;
    if (tx.recurrence === 'fixed') occurrences = 12; // Mensal (12 meses)
    if (tx.recurrence === 'annual') occurrences = 10; // Anual (10 anos)
    if (tx.recurrence === 'installments') occurrences = tx.installments || 1;

    for (let i = 0; i < occurrences; i++) {
      let instYear = year;
      let instMonth = month;
      
      if (tx.recurrence === 'annual') {
        instYear += i;
      } else {
        instMonth += i;
        while (instMonth > 12) {
          instMonth -= 12;
          instYear += 1;
        }
      }
      
      // Handle end of month overflow (e.g. Jan 31 -> Feb 28)
      let instDay = day;
      const daysInMonth = new Date(instYear, instMonth, 0).getDate();
      if (instDay > daysInMonth) {
        instDay = daysInMonth;
      }
      
      const instDateStr = `${instYear}-${String(instMonth).padStart(2, '0')}-${String(instDay).padStart(2, '0')}`;

      active.push({
        ...tx,
        id: `${tx.id}_${i}`,
        date: instDateStr,
        description: tx.recurrence === 'installments' ? `${tx.description} (${i + 1}/${occurrences})` : tx.description
      });
    }

  });

  let filtered = active;
  active.forEach(tx => { if (!tx.date || typeof tx.date !== 'string') tx.date = new Date().toISOString().split('T')[0]; });

  if (currentMonth) {
    filtered = active.filter(tx => tx && tx.date && typeof tx.date === 'string' && tx.date.startsWith(currentMonth));
  }

  return filtered.sort((a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0));
};

export const getPreviousBalance = (data: LocalData, currentMonth: string): number => {
  const allActive = getActiveTransactions(data);
  let balance = 0;
  
  // currentMonth format is YYYY-MM
  const targetDateStr = `${currentMonth}-01`;
  
  for (const tx of allActive) {
    if (tx.date && typeof tx.date === 'string' && tx.date < targetDateStr) {
      if (tx.status === 'paid') {
        balance += tx.type === 'income' ? tx.amount : -tx.amount;
      }
    }
  }
  
  return balance;
};

// Merge function for Sync
export const mergeData = (local: LocalData, cloud: LocalData): LocalData => {
  const merged: LocalData = { 
    transactions: { ...(local?.transactions || {}) },
    categories: Array.from(new Set([...(local?.categories || DEFAULT_CATEGORIES), ...(cloud?.categories || [])])),
    cards: { ...(local?.cards || {}), ...(cloud?.cards || {}) },
    people: { ...(local?.people || {}), ...(cloud?.people || {}) },
    savings: { ...(local?.savings || {}), ...(cloud?.savings || {}) }
  };
  
  for (const [id, cloudTx] of Object.entries(cloud?.transactions || {})) {
    const localTx = merged.transactions[id];
    if (!localTx || cloudTx.updatedAt > localTx.updatedAt) {
      merged.transactions[id] = cloudTx;
    }
  }

  return merged;
};
