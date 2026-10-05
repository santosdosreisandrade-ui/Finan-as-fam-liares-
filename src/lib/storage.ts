import { LocalData, Transaction } from '../types';
import { getDoc, setDoc } from 'firebase/firestore/lite';
import { financesDocRef } from './firebaseClient';

const DEFAULT_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Luz', 'Água', 'Gás', 'Streaming', 'Presente', 'Criança', 'Delivery', 'Outros'];

export const getRemoteData = async (): Promise<LocalData> => {
  try {
    let parsed: LocalData | null = null;

    // 1. Tenta ler diretamente do Firestore (funciona nativamente no Android APK e na Web)
    try {
      const snap = await getDoc(financesDocRef);
      if (snap.exists()) {
        parsed = snap.data() as LocalData;
      }
    } catch (firestoreErr) {
      console.warn('Direct Firestore read failed, attempting /api/data fallback:', firestoreErr);
    }

    // 2. Se a leitura direta não obteve dados, tenta o endpoint /api/data (fallback Web)
    if (!parsed) {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          parsed = await res.json() as LocalData;
        }
      } catch (apiErr) {
        console.warn('API endpoint fetch failed:', apiErr);
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('No data received from cloud');
    }
    
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
  if (!data || typeof data !== 'object') {
    console.warn('Blocked attempt to save null or invalid data');
    return;
  }

  // Atualiza sempre o backup local no localStorage
  try {
    localStorage.setItem('fintrack_local_backup', JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to update local backup in localStorage', err);
  }

  try {
    // 1. Antes de qualquer gravação, faz a leitura do documento existente no Firestore
    const snap = await getDoc(financesDocRef);
    let mergedData: LocalData = { ...data };

    if (snap.exists()) {
      const existingData = snap.data() as LocalData;
      
      // TRAVA DE SEGURANÇA: se os dados a salvar tiverem transações vazias,
      // mas o Firestore tiver transações existentes, PRESERVA as transações existentes
      const incomingTxCount = Object.keys(data.transactions || {}).length;
      const existingTxCount = Object.keys(existingData.transactions || {}).length;
      
      if (incomingTxCount === 0 && existingTxCount > 0) {
        console.warn('Proteção acionada: impedida sobrescrita com transações vazias.');
        mergedData.transactions = existingData.transactions;
      }

      // Preserva quaisquer coleções existentes que não estejam no payload recebido
      if (!mergedData.people && existingData.people) mergedData.people = existingData.people;
      if (!mergedData.cards && existingData.cards) mergedData.cards = existingData.cards;
      if (!mergedData.savings && existingData.savings) mergedData.savings = existingData.savings;
      if (!mergedData.machines && existingData.machines) mergedData.machines = existingData.machines;
      if (!mergedData.housings && existingData.housings) mergedData.housings = existingData.housings;
      if (!mergedData.insurances && existingData.insurances) mergedData.insurances = existingData.insurances;
      if (!mergedData.devices && existingData.devices) mergedData.devices = existingData.devices;
      if (!mergedData.logs && existingData.logs) mergedData.logs = existingData.logs;
      if (!mergedData.budgets && existingData.budgets) mergedData.budgets = existingData.budgets;
    }

    // 2. Grava diretamente no documento appData/finances existente
    await setDoc(financesDocRef, mergedData);

    // 3. Notifica o endpoint /api/data caso esteja no ambiente Web para manter sincronia
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedData)
      }).catch(() => {});
    }
  } catch (firestoreError) {
    console.warn('Direct Firestore write failed, trying fallback to /api/data:', firestoreError);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save data via /api/data');
    } catch (apiErr) {
      console.error('Failed to save to cloud, saved locally in cache', apiErr);
    }
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
