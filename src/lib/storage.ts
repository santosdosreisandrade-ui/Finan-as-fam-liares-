import { LocalData, Transaction } from '../types';
import { getDoc, setDoc } from 'firebase/firestore/lite';
import { financesDocRef } from './firebaseClient';

export const DEFAULT_CATEGORIES = [
  'Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde',
  'Educação', 'Luz', 'Água', 'Gás', 'Streaming',
  'Presente', 'Criança', 'Delivery', 'Outros'
];

type SyncListener = (data: LocalData) => void;
const syncListeners = new Set<SyncListener>();

export const onDataSynced = (listener: SyncListener): (() => void) => {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
};

const notifySyncListeners = (data: LocalData) => {
  syncListeners.forEach(listener => {
    try {
      listener(data);
    } catch (e) {
      console.error('[Storage] Erro no listener de sincronização:', e);
    }
  });
};

/**
 * Retorna a cópia local do localStorage imediatamente (síncrona).
 */
export const getLocalBackup = (): LocalData => {
  if (typeof window === 'undefined') {
    return { transactions: {}, categories: DEFAULT_CATEGORIES };
  }
  try {
    const raw = localStorage.getItem('fintrack_local_backup');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.transactions) parsed.transactions = {};
        if (!parsed.categories) parsed.categories = DEFAULT_CATEGORIES;
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Storage] Falha ao ler cópia local do localStorage:', err);
  }
  return { transactions: {}, categories: DEFAULT_CATEGORIES };
};

/**
 * Salva a cópia local no localStorage e atualiza metadados locais.
 */
export const saveLocalBackup = (data: LocalData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('fintrack_local_backup', JSON.stringify(data));
    localStorage.setItem('fintrack_last_local_update', String(Date.now()));
  } catch (err) {
    console.warn('[Storage] Falha ao salvar no localStorage:', err);
  }
};

/**
 * Mesclagem segura entre dados locais e dados da nuvem.
 * Nunca substitui dados locais mais novos por dados antigos vindos do Firestore.
 */
export const mergeData = (local: LocalData, cloud: LocalData, hasLocalPending: boolean = false): LocalData => {
  if (!cloud || typeof cloud !== 'object') return local || { transactions: {}, categories: DEFAULT_CATEGORIES };
  if (!local || typeof local !== 'object') return cloud || { transactions: {}, categories: DEFAULT_CATEGORIES };

  const merged: LocalData = {
    transactions: { ...(cloud.transactions || {}) },
    categories: Array.from(new Set([
      ...(local.categories || DEFAULT_CATEGORIES),
      ...(cloud.categories || DEFAULT_CATEGORIES)
    ])).filter(c => c !== 'Veículo'),
    cards: { ...(cloud.cards || {}), ...(local.cards || {}) },
    people: { ...(cloud.people || {}), ...(local.people || {}) },
    savings: { ...(cloud.savings || {}), ...(local.savings || {}) },
    machines: { ...(cloud.machines || {}), ...(local.machines || {}) },
    housings: { ...(cloud.housings || {}), ...(local.housings || {}) },
    insurances: { ...(cloud.insurances || {}), ...(local.insurances || {}) },
    devices: { ...(cloud.devices || {}), ...(local.devices || {}) },
    logs: { ...(cloud.logs || {}), ...(local.logs || {}) },
    budgets: { ...(cloud.budgets || {}), ...(local.budgets || {}) }
  };

  // Mesclagem de transações baseada em updatedAt e estado de pendência
  const allTxIds = new Set([
    ...Object.keys(cloud.transactions || {}),
    ...Object.keys(local.transactions || {})
  ]);

  for (const id of allTxIds) {
    const cloudTx = cloud.transactions?.[id];
    const localTx = local.transactions?.[id];

    if (cloudTx && !localTx) {
      merged.transactions[id] = cloudTx;
    } else if (localTx && !cloudTx) {
      merged.transactions[id] = localTx;
    } else if (localTx && cloudTx) {
      if (hasLocalPending) {
        if ((localTx.updatedAt || 0) >= (cloudTx.updatedAt || 0)) {
          merged.transactions[id] = localTx;
        } else {
          merged.transactions[id] = cloudTx;
        }
      } else {
        if ((cloudTx.updatedAt || 0) > (localTx.updatedAt || 0)) {
          merged.transactions[id] = cloudTx;
        } else {
          merged.transactions[id] = localTx;
        }
      }
    }
  }

  // Migração legada de 'Veículo' para 'Transporte'
  Object.values(merged.transactions).forEach(tx => {
    if (tx.category === 'Veículo') tx.category = 'Transporte';
  });

  return merged;
};

/**
 * Tenta sincronizar as alterações pendentes da fila local com o Firestore.
 */
export const syncPendingWithFirestore = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log('[Storage] Dispositivo offline. Sincronização pendente aguardando reconexão.');
    return false;
  }

  const hasPending = typeof window !== 'undefined' && localStorage.getItem('fintrack_has_pending_sync') === 'true';
  const localData = getLocalBackup();

  try {
    // 1. Obtém dados existentes do Firestore para mesclagem segura
    const snap = await getDoc(financesDocRef);
    let finalData = localData;

    if (snap.exists()) {
      const cloudData = snap.data() as LocalData;
      finalData = mergeData(localData, cloudData, hasPending);

      // Trava de segurança anti-sobrescrita com dados vazios
      const localTxCount = Object.keys(localData.transactions || {}).length;
      const cloudTxCount = Object.keys(cloudData.transactions || {}).length;
      if (localTxCount === 0 && cloudTxCount > 0) {
        console.warn('[Storage] Proteção acionada: impedida sobrescrita com transações vazias.');
        finalData.transactions = cloudData.transactions;
      }
    }

    // 2. Grava no documento appData/finances existente no Firestore
    await setDoc(financesDocRef, finalData);

    // 3. Verifica se a gravação realmente foi concluída
    const verifySnap = await getDoc(financesDocRef);
    if (!verifySnap.exists()) {
      throw new Error('Verificação pós-gravação falhou: documento não encontrado no Firestore.');
    }

    // 4. Gravação confirmada com sucesso: atualiza cópia local e remove da fila pendente
    saveLocalBackup(finalData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fintrack_has_pending_sync', 'false');
    }
    console.log('[Storage] Sincronizou com Firestore com sucesso e verificado.');

    // Notifica fallback /api/data caso esteja no ambiente Web
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      }).catch(() => {});
    }

    notifySyncListeners(finalData);
    return true;
  } catch (error) {
    console.warn('[Storage] Falha ao sincronizar com Firestore. Ficou pendente na fila para tentar novamente:', error);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fintrack_has_pending_sync', 'true');
    }
    return false;
  }
};

/**
 * Carrega dados na inicialização:
 * - Se offline, carrega imediatamente a cópia local;
 * - Se online, carrega local e Firestore, faz mesclagem segura (pendências locais têm prioridade)
 *   e sincroniza a versão resultante com o Firestore.
 */
export const getRemoteData = async (): Promise<LocalData> => {
  const localData = getLocalBackup();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    console.log('[Storage] Dispositivo offline na inicialização. Carregando cópia local imediatamente.');
    return localData;
  }

  console.log('[Storage] Dispositivo online na inicialização. Carregando dados locais e buscando nuvem...');
  let cloudData: LocalData | null = null;

  // 1. Tenta ler diretamente do Firestore
  try {
    const snap = await getDoc(financesDocRef);
    if (snap.exists()) {
      cloudData = snap.data() as LocalData;
    }
  } catch (firestoreErr) {
    console.warn('[Storage] Leitura direta do Firestore falhou, tentando fallback /api/data:', firestoreErr);
  }

  // 2. Fallback /api/data na Web
  if (!cloudData) {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        cloudData = await res.json() as LocalData;
      }
    } catch (apiErr) {
      console.warn('[Storage] Fallback /api/data falhou:', apiErr);
    }
  }

  // Se a nuvem não respondeu, utiliza a cópia local com segurança
  if (!cloudData || typeof cloudData !== 'object') {
    console.log('[Storage] Nuvem não retornou dados. Mantendo cópia local.');
    return localData;
  }

  // 3. Mesclagem segura: alterações locais pendentes têm prioridade sobre dados antigos da nuvem
  const hasPending = typeof window !== 'undefined' && localStorage.getItem('fintrack_has_pending_sync') === 'true';
  const mergedData = mergeData(localData, cloudData, hasPending);

  // Trava de segurança: preserva transações existentes se a mesclagem resultar vazia
  const cloudTxCount = Object.keys(cloudData.transactions || {}).length;
  const mergedTxCount = Object.keys(mergedData.transactions || {}).length;
  if (mergedTxCount === 0 && cloudTxCount > 0) {
    console.warn('[Storage] Proteção acionada: restaurando transações da nuvem.');
    mergedData.transactions = cloudData.transactions;
  }

  // Salva localmente imediatamente
  saveLocalBackup(mergedData);
  console.log('[Storage] Salvou localmente os dados mesclados.');

  // 4. Sincroniza a versão resultante com o Firestore
  try {
    await setDoc(financesDocRef, mergedData);
    const verifySnap = await getDoc(financesDocRef);
    if (verifySnap.exists()) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('fintrack_has_pending_sync', 'false');
      }
      console.log('[Storage] Sincronizou com Firestore na inicialização.');
    }
  } catch (syncErr) {
    console.warn('[Storage] Falha ao sincronizar mesclagem com Firestore. Ficou pendente:', syncErr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fintrack_has_pending_sync', 'true');
    }
  }

  return mergedData;
};

/**
 * Salva uma alteração:
 * 1. Salva localmente imediatamente antes de tentar a nuvem.
 * 2. Adiciona à fila de pendências caso offline ou caso a gravação falhe.
 * 3. Se online, grava no Firestore e verifica a conclusão.
 */
export const setRemoteData = async (data: LocalData): Promise<void> => {
  if (!data || typeof data !== 'object') {
    console.warn('[Storage] Bloqueada tentativa de salvar dados nulos ou inválidos.');
    return;
  }

  // 1. Salva localmente imediatamente
  saveLocalBackup(data);
  if (typeof window !== 'undefined') {
    localStorage.setItem('fintrack_has_pending_sync', 'true');
  }
  console.log('[Storage] Salvou localmente com sucesso. Pendente de sincronização com Firestore.');

  // 2. Se offline, mantém na fila pendente e encerra
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    console.log('[Storage] Dispositivo offline. Ficou pendente na fila de sincronização.');
    return;
  }

  // 3. Tenta sincronizar com o Firestore
  try {
    const snap = await getDoc(financesDocRef);
    let finalData = data;

    if (snap.exists()) {
      const existingData = snap.data() as LocalData;

      // Trava de proteção contra sobrescrita com transações vazias
      const incomingTxCount = Object.keys(data.transactions || {}).length;
      const existingTxCount = Object.keys(existingData.transactions || {}).length;
      if (incomingTxCount === 0 && existingTxCount > 0) {
        console.warn('[Storage] Proteção acionada: impedida sobrescrita com transações vazias.');
        finalData = { ...data, transactions: existingData.transactions };
      }

      // Preserva coleções pré-existentes caso o objeto recebido não as contenha
      if (!finalData.people && existingData.people) finalData.people = existingData.people;
      if (!finalData.cards && existingData.cards) finalData.cards = existingData.cards;
      if (!finalData.savings && existingData.savings) finalData.savings = existingData.savings;
      if (!finalData.machines && existingData.machines) finalData.machines = existingData.machines;
      if (!finalData.housings && existingData.housings) finalData.housings = existingData.housings;
      if (!finalData.insurances && existingData.insurances) finalData.insurances = existingData.insurances;
      if (!finalData.devices && existingData.devices) finalData.devices = existingData.devices;
      if (!finalData.logs && existingData.logs) finalData.logs = existingData.logs;
      if (!finalData.budgets && existingData.budgets) finalData.budgets = existingData.budgets;
    }

    // Grava no documento existente
    await setDoc(financesDocRef, finalData);

    // Verifica se a gravação realmente foi concluída
    const verifySnap = await getDoc(financesDocRef);
    if (!verifySnap.exists()) {
      throw new Error('Verificação pós-gravação falhou.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('fintrack_has_pending_sync', 'false');
    }
    console.log('[Storage] Sincronizou com Firestore com sucesso e verificado.');

    // Notifica fallback /api/data na Web
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      }).catch(() => {});
    }
  } catch (firestoreError) {
    console.warn('[Storage] Falha ao sincronizar com Firestore. Ficou pendente na fila:', firestoreError);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fintrack_has_pending_sync', 'true');
    }

    // Tenta fallback secundário /api/data
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok && typeof window !== 'undefined') {
        localStorage.setItem('fintrack_has_pending_sync', 'false');
      }
    } catch {
      // Permanece na fila pendente local
    }
  }
};

/**
 * Escuta eventos de reconexão de rede para sincronizar automaticamente a fila pendente.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Storage] Conexão com a internet restabelecida. Sincronizando fila pendente...');
    syncPendingWithFirestore().then(success => {
      if (success) {
        console.log('[Storage] Sincronizou novamente após recuperar a internet.');
      }
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      const hasPending = localStorage.getItem('fintrack_has_pending_sync') === 'true';
      if (hasPending) {
        syncPendingWithFirestore();
      }
    }
  });
}

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
