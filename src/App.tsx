import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Plus, X, ChevronLeft, ChevronRight, CreditCard, Users, Heart, Vault, Home, Castle, Building, Activity, ClipboardList, Scale, Bell, BellRing, Shield, Database } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { FamilyManager } from './components/FamilyManager';
import { PendingAlerts } from './components/PendingAlerts';
import { SavingsManager } from './components/SavingsManager';
import { HealthManager } from './components/HealthManager';
import { getRemoteData, setRemoteData, getActiveTransactions, getPreviousBalance, mergeData, getLocalBackup, onDataSynced } from './lib/storage';
import { EditTransactionModal } from './components/EditTransactionModal';
import { ConfirmPaymentModal } from './components/ConfirmPaymentModal';
import { PlanningManager } from './components/PlanningManager';
import { LockScreen, SecuritySettingsModal } from './components/Security';
import { AuditLogsModal } from './components/AuditLogsModal';
import { showNotification, requestNotificationPermission, getNotificationPermission, initNotificationChannel } from './lib/notifications';
import { MemoryModal } from './components/MemoryModal';
import { DevicesModal } from './components/DevicesModal';
import { Transaction, LocalData, Card, Person, Savings, Machine } from './types';


export default function App() {
  const [data, setData] = useState<LocalData>(() => getLocalBackup());

  
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('fintrack_device_id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();
      localStorage.setItem('fintrack_device_id', id);
    }
    return id;
  });
  const [showDevices, setShowDevices] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  const [userName, setUserName] = useState(localStorage.getItem('fintrack_username'));
  const [tempUserName, setTempUserName] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  
  

  const detectDevice = () => {
    const ua = navigator.userAgent;
    let type: 'smartphone' | 'tablet' | 'pc' = 'pc';
    if (/tablet|ipad|playbook|silk/i.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)) {
      type = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      type = 'smartphone';
    }

    let name = 'Desconhecido';
    if (ua.includes('iPhone')) name = 'iPhone';
    else if (ua.includes('iPad')) name = 'iPad';
    else if (ua.includes('Mac OS')) name = 'Mac';
    else if (ua.includes('Windows')) name = 'Windows PC';
    else if (ua.includes('Android')) {
      const match = ua.match(/Androids([^s;]+);?s?([^;]+)?/);
      name = match && match[2] ? `Android (${match[2].trim()})` : 'Android';
    } else if (ua.includes('Linux')) name = 'Linux PC';

    return { type, name };
  };

  const USERS: Record<string, { name: string, password: string }> = {
    '05797215748': { name: 'Thayná', password: '241026' },
    '15091447733': { name: 'Alexandre', password: '241026' }
  };

  const saveUserName = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginInput = tempUserName.trim();
    if (!loginInput) return;
    
    let uname = loginInput;
    const isSecretAdmin = loginInput === '4107' || loginInput === '4701';
    
    if (!isSecretAdmin) {
      const userObj = USERS[loginInput];
      if (!userObj) {
        alert('Usuário não encontrado. Use o seu CPF.');
        return;
      }
      if (userObj.password !== tempPassword) {
        alert('Senha incorreta.');
        return;
      }
      uname = userObj.name;
    }

    localStorage.setItem('fintrack_username', uname);
    setUserName(uname);
    
    // MUDANÇA CRÍTICA: Buscar dados mais recentes antes de salvar, 
    // para garantir que não sobrescreva a nuvem com dados locais vazios.
    const latestData = await getRemoteData();
    
    const newDevices = { ...(latestData.devices || {}) };
    
    
    const { type, name } = detectDevice();
    
    newDevices[deviceId] = {
      id: deviceId,
      userName: uname,
      deviceName: name,
      deviceType: type,
      status: 'authorized',
      requestedAt: Date.now()
    };
    
    const newData = { ...latestData, devices: newDevices };
    setData(newData);
    setRemoteData(newData);
  };


  const applyDataChange = (newData: LocalData, action: 'Criou' | 'Editou' | 'Excluiu', entityType: string, entityName: string) => {
    const rawUserName = localStorage.getItem('fintrack_username') || 'Desconhecido';
    const logUserName = (rawUserName === '4107' || rawUserName === '4701') ? 'Administrador' : rawUserName;
    const log = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      timestamp: Date.now(),
      userName,
      action: action as any,
      entityType,
      entityName
    };
    newData.logs = { ...(newData.logs || {}), [log.id]: log };
    setData(newData);
    setRemoteData(newData);
  };
  
  const [isUnlocked, setIsUnlocked] = useState(!localStorage.getItem('app_bio_id'));
  const [showSecurity, setShowSecurity] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  
  const hasCastle = Object.values(data.housings || {}).some(h => h.name.toUpperCase() === 'CASTELO');
  const currentDevice = data.devices?.[deviceId];
  const isAuthorized = !!userName;
  const pendingDevices = Object.values(data.devices || {}).filter(d => d.status === 'pending');

  const prevPendingRef = useRef(pendingDevices.length);
  useEffect(() => {
    if (isAuthorized && pendingDevices.length > prevPendingRef.current) {
      // New device request!
      const latestDevice = pendingDevices.sort((a, b) => b.requestedAt - a.requestedAt)[0];
      if (latestDevice) {
        showNotification('Novo Aparelho Solicitando Acesso', {
          body: `O usuário ${latestDevice.userName} quer acessar o aplicativo.`
        });
      }
    }
    prevPendingRef.current = pendingDevices.length;
  }, [pendingDevices.length, isAuthorized]);



  useEffect(() => {
    if (userName === '4107') {
      const timer = setTimeout(() => {
        localStorage.removeItem('fintrack_username');
        setUserName(null);
        alert('Modo Administrador expirado. Acesso finalizado.');
      }, 10 * 60 * 1000); // 10 minutes
      return () => clearTimeout(timer);
    }
  }, [userName]);

  useEffect(() => {
    if (userName && !currentDevice && data.categories) {
      // If the user has a username but their device is not registered in the system yet (e.g. they were an old user before this feature, or they are stuck)
      const newDevices = { ...(data.devices || {}) };
      const isFirst = Object.keys(newDevices).length === 0;
      const isSecretAdmin = userName === '4107';
      
      newDevices[deviceId] = {
        id: deviceId,
        userName: userName,
        status: 'authorized',
        requestedAt: Date.now()
      };
      
      const newData = { ...data, devices: newDevices };
      setData(newData);
      setRemoteData(newData);
    }
  }, [userName, currentDevice, data, deviceId]);

  const hasApartment = Object.values(data.housings || {}).some(h => h.name.toUpperCase() === 'APARTAMENTO');
  const MainHomeIcon = hasCastle ? Castle : (hasApartment ? Building : Home);

  const hasPet = Object.values(data.people || {}).some(p => p.role === 'pet');
  const computedCategories = [...(data.categories || [])];
  if (hasPet && !computedCategories.includes('Pet')) {
    computedCategories.push('Pet');
  }

  // Initialize local data and subscribe to background sync
  useEffect(() => {
    getRemoteData().then(d => {
      if (d) setData(d);
    });

    const unsubscribe = onDataSynced((syncedData) => {
      if (syncedData) setData(syncedData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const activeMonthBtn = document.getElementById('month-btn-' + currentMonth.split('-')[1]);
    if (activeMonthBtn) {
      activeMonthBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentMonth]);

  
    const [activeTab, setActiveTab] = useState<'ledger' | 'family' | 'savings' | 'health' | 'planning'>('ledger');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    initNotificationChannel();
    getNotificationPermission().then(perm => {
      setNotificationsEnabled(perm === 'granted');
    });
  }, []);

  const checkAndSendNotifications = async (force = false) => {
    const perm = await getNotificationPermission();
    if (perm !== 'granted') return;
    if (!data || !data.transactions) return;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check pending transactions
    const todayPending = Object.values(data.transactions)
      .filter((tx: any) => !tx.deleted && tx.type === 'expense' && tx.status === 'pending' && tx.date === todayStr);

    // Check due cards
    const dueCards = Object.values(data.cards || {}).filter((card: any) => {
      if (!card.alertEnabled) return false;
      if (card.dueDateType === 'fixed') {
        return card.dueDateValue === today.getDate();
      } else {
        let count = 0;
        for (let i = 1; i <= today.getDate(); i++) {
          const d = new Date(today.getFullYear(), today.getMonth(), i);
          if (d.getDay() !== 0 && d.getDay() !== 6) {
            count++;
          }
        }
        return card.dueDateValue === count;
      }
    });

    const hasPending = todayPending.length > 0;
    const hasDueCards = dueCards.length > 0;

    if (hasPending || hasDueCards) {
      const lastNotified = localStorage.getItem('lastNotificationDate');
      if (lastNotified !== todayStr || force) {
        let bodyText = '';
        if (hasPending && hasDueCards) {
          bodyText = `Você tem ${todayPending.length} conta(s) pendente(s) e ${dueCards.length} cartão(ões) vencendo hoje (${dueCards.map(c => c.nickname).join(', ')}).`;
        } else if (hasPending) {
          bodyText = `Você tem ${todayPending.length} conta(s) pendente(s) hoje.`;
        } else {
          bodyText = `Seu cartão ${dueCards.map(c => c.nickname).join(', ')} vence hoje!`;
        }

        await showNotification('Finanças: Alertas de Hoje', {
          body: bodyText,
          icon: '/favicon.jpg'
        });
        localStorage.setItem('lastNotificationDate', todayStr);
      }
    } else if (force) {
      await showNotification('Finanças', {
        body: 'Tudo em dia! Nenhuma conta ou cartão para hoje.',
        icon: '/favicon.jpg'
      });
    }
  };

  const toggleNotifications = async () => {
    const currentPerm = await getNotificationPermission();
    if (currentPerm === 'granted') {
      checkAndSendNotifications(true);
    } else {
      const permission = await requestNotificationPermission();
      const granted = permission === 'granted';
      setNotificationsEnabled(granted);
      if (granted) {
        checkAndSendNotifications(true);
      } else if (permission === 'denied') {
        alert('As notificações foram bloqueadas. Habilite-as nas configurações do seu aparelho.');
      }
    }
  };

  useEffect(() => {
    if (data && data.transactions && Object.keys(data.transactions).length > 0) {
      checkAndSendNotifications();
    }
  }, [data.transactions]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [payingTxId, setPayingTxId] = useState<string | null>(null);

  const formatMonthYear = (value: string) => {
    const [year, month] = value.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    // Remove pontuação que alguns navegadores podem colocar (ex: '.' em ago.)
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').toUpperCase();
  };

  
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    // Check if it's primarily a horizontal swipe
    if (Math.abs(distanceX) > Math.abs(distanceY) * 1.5) {
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;

      if (isLeftSwipe && (activeTab === 'ledger' || activeTab === 'planning')) {
        changeMonth(1);
      }
      if (isRightSwipe && (activeTab === 'ledger' || activeTab === 'planning')) {
        changeMonth(-1);
      }
    }
  };

  const changeMonth = (offset: number) => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1 + offset, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const saveSavings = (saving: Savings) => {
    const newData = {
      ...data,
      savings: {
        ...(data.savings || {}),
        [saving.id]: saving
      }
    };
    setData(newData);
    setRemoteData(newData);
  };

  const deleteSavings = (id: string) => {
    const newSavings = { ...(data.savings || {}) };
    delete newSavings[id];
    const newData = { ...data, savings: newSavings };
    applyDataChange(newData, 'Excluiu', 'Cofre', data.savings?.[id]?.name || data.savings?.[id]?.bank || 'Item');

  };

  
  
  const addHousing = (housing: any) => {
    const newData = {
      ...data,
      housings: {
        ...(data.housings || {}),
        [housing.id]: housing
      }
    };
    applyDataChange(newData, 'Criou', 'Imóveis', housing.name || 'Item');

  };

  const updateHousing = (housing: any) => {
    const newData = {
      ...data,
      housings: {
        ...(data.housings || {}),
        [housing.id]: housing
      }
    };
    applyDataChange(newData, 'Editou', 'Imóveis', housing.name || 'Item');

  };

  const deleteHousing = (id: string) => {
    const newHousings = { ...(data.housings || {}) };
    delete newHousings[id];
    const newData = {
      ...data,
      housings: newHousings
    };
    applyDataChange(newData, 'Excluiu', 'Imóveis', data.housings?.[id]?.name || 'Item');

  };

  const addInsurance = (insurance: any) => {
    const newData = {
      ...data,
      insurances: {
        ...(data.insurances || {}),
        [insurance.id]: insurance
      }
    };
    applyDataChange(newData, 'Criou', 'Seguros', insurance.company || 'Item');

  };

  const updateInsurance = (insurance: any) => {
    const newData = {
      ...data,
      insurances: {
        ...(data.insurances || {}),
        [insurance.id]: insurance
      }
    };
    applyDataChange(newData, 'Editou', 'Seguros', insurance.company || 'Item');

  };

  const deleteInsurance = (id: string) => {
    const newInsurances = { ...(data.insurances || {}) };
    delete newInsurances[id];
    const newData = {
      ...data,
      insurances: newInsurances
    };
    applyDataChange(newData, 'Excluiu', 'Seguros', data.insurances?.[id]?.company || 'Item');

  };


  const addMachine = (machine: Machine) => {
    const newData = {
      ...data,
      machines: {
        ...(data.machines || {}),
        [machine.id]: machine
      }
    };
    applyDataChange(newData, 'Criou', 'Máquinas', machine.name || 'Item');

  };

  const updateMachine = (machine: Machine) => {
    const newData = {
      ...data,
      machines: {
        ...(data.machines || {}),
        [machine.id]: machine
      }
    };
    applyDataChange(newData, 'Editou', 'Máquinas', machine.name || 'Item');

  };

  const deleteMachine = (id: string) => {
    const newMachines = { ...(data.machines || {}) };
    delete newMachines[id];
    const newData = { ...data, machines: newMachines };
    applyDataChange(newData, 'Excluiu', 'Máquinas', data.machines?.[id]?.name || 'Item');

  };

  const addPerson = (person: Person) => {
    const newData = {
      ...data,
      people: {
        ...(data.people || {}),
        [person.id]: person
      }
    };
    applyDataChange(newData, 'Criou', 'Pessoas/Pets', person.name || 'Item');

  };

  const updatePerson = (person: Person) => {
    const newData = {
      ...data,
      people: {
        ...(data.people || {}),
        [person.id]: person
      }
    };
    applyDataChange(newData, 'Editou', 'Pessoas/Pets', person.name || 'Item');

  };

  const deletePerson = (id: string) => {
    const newPeople = { ...(data.people || {}) };
    delete newPeople[id];
    const newData = { ...data, people: newPeople };
    applyDataChange(newData, 'Excluiu', 'Pessoas/Pets', data.people?.[id]?.name || 'Item');

  };

  const addCard = (card: Card) => {
    const newData = {
      ...data,
      cards: {
        ...(data.cards || {}),
        [card.id]: card
      }
    };
    applyDataChange(newData, 'Criou', 'Cartões', card.nickname || 'Item');

  };

  const updateCard = (card: Card) => {
    const newData = {
      ...data,
      cards: {
        ...(data.cards || {}),
        [card.id]: card
      }
    };
    applyDataChange(newData, 'Editou', 'Cartões', card.nickname || 'Item');

  };

  const deleteCard = (id: string) => {
    const newCards = { ...(data.cards || {}) };
    delete newCards[id];
    const newData = { ...data, cards: newCards };
    applyDataChange(newData, 'Excluiu', 'Cartões', data.cards?.[id]?.nickname || 'Item');

  };

  const addTransaction = (payload: Transaction | Transaction[]) => {
    const txs = Array.isArray(payload) ? payload : [payload];
    
    let newCategories = data.categories || [];
    txs.forEach(tx => {
      if (!newCategories.includes(tx.category)) {
        newCategories = [...newCategories, tx.category];
      }
    });

    const newData = {
      ...data,
      transactions: {
        ...data.transactions,
      },
      categories: newCategories
    };

    txs.forEach(tx => {
      newData.transactions[tx.id] = tx;
    });

    applyDataChange(newData, 'Criou', 'Transação', txs.length > 1 ? txs.length + ' Transações' : txs[0]?.description || 'Item');

    
    if (txs.length > 0 && txs[0].date) {
      const [year, month] = txs[0].date.split('-');
      setCurrentMonth(`${year}-${month}`);
    }
    
    // Auto-sync if online
  };

  const updateTransaction = (updatedTx: Transaction, mode: 'only' | 'future' | 'all' = 'only') => {
    const newTransactions = { ...data.transactions };
    const now = Date.now();
    const originalTx = data.transactions[updatedTx.id];

    if (mode === 'only') {
      newTransactions[updatedTx.id] = { ...updatedTx, updatedAt: now };
    } else {
      let relatedIds = [];
      if (originalTx.groupId) {
        relatedIds = Object.keys(newTransactions).filter(
          id => newTransactions[id].groupId === originalTx.groupId && !newTransactions[id].deleted
        );
      } else {
        const baseDesc = (originalTx.description || '').replace(/ \(\d+\/\d+\)$| \(Fixa\)$| \(Anual\)$| \(Semanal\)$/, '');
        relatedIds = Object.keys(newTransactions).filter(
          id => !newTransactions[id].deleted && 
                (newTransactions[id].description || '').startsWith(baseDesc) && 
                newTransactions[id].type === originalTx.type && 
                newTransactions[id].category === originalTx.category
        );
      }

      if (mode === 'future') {
        const targetDate = new Date(originalTx.date).getTime();
        relatedIds = relatedIds.filter(id => new Date(newTransactions[id].date).getTime() >= targetDate);
      }

      const origDateObj = new Date(originalTx.date + 'T12:00:00Z');
      const newDateObj = new Date(updatedTx.date + 'T12:00:00Z');
      const diffMonths = (newDateObj.getFullYear() - origDateObj.getFullYear()) * 12 + (newDateObj.getMonth() - origDateObj.getMonth());
      const newDay = newDateObj.getDate();

      const origBaseDesc = (originalTx.description || '').replace(/ \(\d+\/\d+\)$| \(Fixa\)$| \(Anual\)$| \(Semanal\)$/, '');
      const newBaseDesc = (updatedTx.description || '').replace(/ \(\d+\/\d+\)$| \(Fixa\)$| \(Anual\)$| \(Semanal\)$/, '');

      relatedIds.forEach(id => {
        if (id === updatedTx.id) {
          newTransactions[id] = { ...updatedTx, updatedAt: now };
        } else {
          const tx = newTransactions[id];
          const txDateObj = new Date(tx.date + 'T12:00:00Z');
          txDateObj.setMonth(txDateObj.getMonth() + diffMonths);
          txDateObj.setDate(newDay);
          const newDateStr = txDateObj.toISOString().split('T')[0];

          let newDesc = tx.description;
          if (origBaseDesc !== newBaseDesc) {
             newDesc = (tx.description || '').replace(origBaseDesc, newBaseDesc);
          }

          newTransactions[id] = {
            ...tx,
            description: newDesc,
            amount: updatedTx.amount,
            category: updatedTx.category,
            paymentMethod: updatedTx.paymentMethod,
            sourceId: updatedTx.sourceId,
            date: newDateStr,
            updatedAt: now
          };
        }
      });
    }

    const newData = {
      ...data,
      transactions: newTransactions
    };
    applyDataChange(newData, 'Editou', 'Transação', updatedTx.description || 'Item');

    setEditingTx(null);
  };

  
  const updateBudget = (category: string, amount: number) => {
    const newData = {
      ...data,
      budgets: {
        ...(data.budgets || {}),
        [category]: amount
      }
    };
    applyDataChange(newData, 'Editou', 'Orçamento', category || 'Item');

  };

  
  const deleteTransaction = (id: string) => {
    const transaction = data.transactions[id];
    if (!transaction) return;

    // Check if it has a groupId or looks like an installment/recurrence
    const isLegacyGroup = (transaction.description || '').match(/\(\d+\/\d+\)$|\(Fixa\)$|\(Anual\)$|\(Semanal\)$/);
    if (transaction.groupId || isLegacyGroup) {
      setTransactionToDelete(transaction);
      return;
    }

    executeDelete(transaction, 'only');
  };

  const executeDelete = (transaction: any, mode: 'only' | 'future' | 'all') => {
    const newTransactions = { ...data.transactions };
    const now = Date.now();
    
    if (mode === 'only') {
      newTransactions[transaction.id] = { ...transaction, deleted: true, updatedAt: now } as Transaction;
    } else {
      let relatedIds = [];
      
      if (transaction.groupId) {
        relatedIds = (Object.values(newTransactions) as Transaction[])
          .filter(t => t.groupId === transaction.groupId && !t.deleted)
          .map(t => t.id);
      } else {
        const baseDesc = (transaction.description || '').replace(/ \(\d+\/\d+\)$| \(Fixa\)$| \(Anual\)$| \(Semanal\)$/, '');
        relatedIds = (Object.values(newTransactions) as Transaction[])
          .filter(t => !t.deleted && (t.description || '').startsWith(baseDesc) && t.type === transaction.type && t.category === transaction.category)
          .map(t => t.id);
      }

      if (mode === 'future') {
        const targetDate = new Date(transaction.date).getTime();
        relatedIds = relatedIds.filter(id => new Date(newTransactions[id].date).getTime() >= targetDate);
      }

      relatedIds.forEach(id => {
        newTransactions[id] = { ...newTransactions[id], deleted: true, updatedAt: now } as Transaction;
      });
    }

    const newData = {
      ...data,
      transactions: newTransactions
    };
    applyDataChange(newData, 'Excluiu', 'Transação', transaction?.description || 'Item');

    setTransactionToDelete(null);
  };

  const toggleStatus = (id: string) => {
    const transaction = data.transactions[id];
    if (!transaction) return;

    if (transaction.status === 'pending') {
      setPayingTxId(id);
    } else {
      // Revert to pending
      const newData = {
        ...data,
        transactions: {
          ...data.transactions,
          [id]: { ...transaction, status: 'pending', paymentMethod: undefined, sourceId: undefined, updatedAt: Date.now() } as Transaction
        }
      };
      setData(newData);
      setRemoteData(newData);
    }
  };

  const confirmPayment = (paymentMethod: string, sourceId: string, paidBy: string) => {
    if (!payingTxId) return;
    const transaction = data.transactions[payingTxId];
    if (!transaction) return;
    
    const newData = {
      ...data,
      transactions: {
        ...data.transactions,
        [payingTxId]: { 
          ...transaction, 
          status: 'paid', 
          paymentMethod: paymentMethod as any, 
          sourceId: sourceId || undefined,
          paidBy,
          updatedAt: Date.now() 
        } as Transaction
      }
    };
    setData(newData);
    setRemoteData(newData);
    setPayingTxId(null);
  };

  const addCategory = (category: string) => {
    const currentCategories = data.categories || [];
    if (!category || currentCategories.includes(category)) return;
    
    const newData = { ...data, categories: [...currentCategories, category] };
    applyDataChange(newData, 'Criou', 'Categoria', category || 'Item');

  };

  const removeCategory = (category: string) => {
    const currentCategories = data.categories || [];
    const newData = { ...data, categories: currentCategories.filter(c => c !== category) };
    applyDataChange(newData, 'Excluiu', 'Categoria', category || 'Item');

  };

  const activeTransactions = getActiveTransactions(data, currentMonth);
  const previousBalance = getPreviousBalance(data, currentMonth);




  if (!userName) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex items-center justify-center p-4">
        <form onSubmit={saveUserName} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-lg max-w-sm w-full flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-widest uppercase mb-2">Acesso ao Sistema</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest">Identifique seu aparelho</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">CPF ou Código de Admin</label>
              <input 
                type="text" 
                value={tempUserName}
                onChange={e => setTempUserName(e.target.value)}
                className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Apenas números"
                required
              />
            </div>
            {tempUserName !== '4107' && tempUserName !== '4701' && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Senha</label>
                <input 
                  type="password" 
                  value={tempPassword}
                  onChange={e => setTempPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 p-3 rounded text-white outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="******"
                  required
                />
              </div>
            )}
          </div>
          
          <button type="submit" className="bg-emerald-500 text-black font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-emerald-400 transition-colors">
            Registrar Aparelho
          </button>
        </form>
      </div>
    );
  }



    if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="h-screen bg-[#050505] text-[#e0e0e0] font-sans flex overflow-hidden">

      {pendingDevices.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-4 z-[60] animate-pulse">
          <Shield className="w-4 h-4" />
          <span>{pendingDevices.length} aparelho(s) aguardando acesso</span>
          <button onClick={() => { setShowDevices(true); }} className="bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded transition-colors">Revisar</button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#080808] shrink-0">
        <div className="h-20 border-b border-white/10 px-6 flex items-center gap-3">
          <button onClick={() => setIsAppMenuOpen(true)} className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer">
            <Scale className="w-5 h-5 text-black -rotate-12" />
          </button>
          <h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças {(userName === "4107" || userName === "4701") && <span className="ml-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded align-middle">MODO ADMINISTRADOR</span>}</h1>
          <button onClick={() => setActiveTab('family')} className={`p-2 transition-colors rounded ${activeTab === 'family' ? 'text-emerald-400 bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <Users className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-2">Menu Principal</div>
          
          <button onClick={() => setActiveTab('ledger')} className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'ledger' ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:bg-white/5'}`}>
            <MainHomeIcon className="w-4 h-4" /> Visão Geral
          </button>
          
          <button onClick={() => setActiveTab('planning')} className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'planning' ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:bg-white/5'}`}>
            <ClipboardList className="w-4 h-4" /> Planejamento
          </button>

          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 mt-6 px-2">Gestão</div>
          <button onClick={() => setActiveTab('savings')} className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'savings' ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:bg-white/5'}`}>
            <Vault className="w-4 h-4" /> Cofre
          </button>
          
          <button onClick={() => setActiveTab('health')} className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'health' ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:bg-white/5'}`}>
            <Scale className="w-4 h-4 -rotate-12" /> Equilíbrio
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 md:h-20 border-b border-white/10 px-4 md:px-10 flex items-center justify-between bg-[#080808] shrink-0">
          <div className="flex items-center gap-4 md:hidden w-full">
            <button onClick={() => setIsAppMenuOpen(true)} className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer">
              <Scale className="w-5 h-5 text-black -rotate-12" />
            </button>
            <h1 className="font-bold text-lg tracking-tight uppercase text-white flex-1">Finanças {(userName === "4107" || userName === "4701") && <span className="ml-2 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded align-middle">MODO ADMINISTRADOR</span>}</h1>
            
            <button onClick={() => setActiveTab('family')} className={`p-2 transition-colors rounded ${activeTab === 'family' ? 'text-emerald-400 bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <Users className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(true)}
            className="hidden md:flex w-auto px-4 bg-emerald-500 rounded-lg items-center justify-center gap-2 text-black hover:bg-emerald-400 transition-transform hover:scale-105 ml-auto h-10"
          >
            <Plus className="w-4 h-4" />
            <span className="font-bold text-[10px] uppercase tracking-widest">Nova Transação</span>
          </button>
          </header>

        {/* Mobile Top Navigation */}
      <nav className="md:hidden bg-[#080808] border-b border-white/10 flex items-center overflow-x-auto shrink-0 pb-1 pt-1 no-scrollbar">
        <button onClick={() => setActiveTab('ledger')} className={`p-3 min-w-[70px] flex flex-col items-center gap-1 shrink-0 ${activeTab === 'ledger' ? 'text-emerald-400' : 'text-white/40'}`}>
          <MainHomeIcon className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Início</span>
        </button>
        <button onClick={() => setActiveTab('planning')} className={`p-3 min-w-[70px] flex flex-col items-center gap-1 shrink-0 ${activeTab === 'planning' ? 'text-emerald-400' : 'text-white/40'}`}>
          <ClipboardList className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Planos</span>
        </button>

        <div className="flex items-center justify-center p-2 min-w-[80px] shrink-0">
          <button onClick={() => setIsFormOpen(true)} className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] border-4 border-[#080808] hover:bg-emerald-400 transition-transform hover:scale-105 relative z-10 shrink-0">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        

        <button onClick={() => setActiveTab('savings')} className={`p-3 min-w-[70px] flex flex-col items-center gap-1 shrink-0 ${activeTab === 'savings' ? 'text-emerald-400' : 'text-white/40'}`}>
          <Vault className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Cofre</span>
        </button>

        <button onClick={() => setActiveTab('health')} className={`p-3 min-w-[70px] flex flex-col items-center gap-1 shrink-0 ${activeTab === 'health' ? 'text-emerald-400' : 'text-white/40'}`}>
          <Scale className="w-5 h-5 -rotate-12" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Equilíbrio</span>
        </button>
      </nav>

        <main 
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEndEvent}
          className="flex-1 flex flex-col p-4 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar pb-32 md:pb-10">
                    {(activeTab === 'ledger' || activeTab === 'planning') && (
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/10 overflow-x-auto custom-scrollbar shrink-0">
              <button onClick={() => {
                  const [y, m] = currentMonth.split('-');
                  setCurrentMonth(`${parseInt(y) - 1}-${m}`);
                }} className="p-1.5 text-white/50 hover:text-white transition-colors rounded hover:bg-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-black text-white/30 mr-2 tracking-widest">{currentMonth.split('-')[0]}</span>
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m, i) => {
                const isSelected = m === currentMonth.split('-')[1];
                return (
                  <button 
                    key={m}
                    id={`month-btn-${m}`}
                    onClick={() => {
                      setCurrentMonth(`${currentMonth.split('-')[0]}-${m}`);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors whitespace-nowrap ${isSelected ? 'bg-red-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i]}
                  </button>
                );
              })}
              <button onClick={() => {
                  const [y, m] = currentMonth.split('-');
                  setCurrentMonth(`${parseInt(y) + 1}-${m}`);
                }} className="p-1.5 text-white/50 hover:text-white transition-colors rounded hover:bg-white/10">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${currentMonth}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >


          {activeTab === 'ledger' && (
            <>
              <PendingAlerts 
                transactions={(Object.values(data.transactions || {}) as Transaction[]).filter(tx => !tx.deleted)} 
                onToggleStatus={toggleStatus} 
              />
              <Dashboard transactions={activeTransactions} previousBalance={previousBalance} />
              <div className="flex flex-col gap-10 flex-1 min-h-0 mt-8">
                <TransactionList 
                  transactions={activeTransactions} 
                  cards={data.cards || {}}
                  people={data.people || {}}
                  onDelete={deleteTransaction}                 
                  onToggleStatus={toggleStatus} 
                  onEdit={setEditingTx}
                />
                <div className="mt-8 mb-4 text-center text-[10px] text-white/20 uppercase tracking-widest font-bold pb-20 md:pb-0">
                  V02.05
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'planning' && (
            <PlanningManager 
              transactions={activeTransactions}
              categories={computedCategories}
              budgets={data.budgets || {}}
              onUpdateBudget={updateBudget}
              currentMonth={currentMonth}
              onAddCategory={addCategory}
              people={data.people || {}}
            />
          )}

          

          {activeTab === 'family' && (
            <FamilyManager 
              people={data.people || {}} 
              machines={data.machines || {}}
              cards={data.cards || {}}
              onAddPerson={addPerson} 
              onUpdatePerson={updatePerson} 
              onDeletePerson={deletePerson}
              onAddMachine={addMachine}
              onUpdateMachine={updateMachine}
              onDeleteMachine={deleteMachine}
              onAddHousing={addHousing}
              onUpdateHousing={updateHousing}
              onDeleteHousing={deleteHousing}
              housings={data.housings || {}}
              insurances={data.insurances || {}}
              onAddInsurance={addInsurance}
              onUpdateInsurance={updateInsurance}
              onDeleteInsurance={deleteInsurance}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsManager 
              savings={data.savings || {}} 
              onSave={saveSavings} 
              people={data.people || {}}
              onDelete={deleteSavings} 
            />
          )}

          {activeTab === 'health' && (
            <HealthManager transactions={getActiveTransactions(data)} cards={data.cards || {}} people={data.people || {}} />
          )}

          {transactionToDelete && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-[#050505] border border-white/10 p-6 flex flex-col gap-4 max-w-sm w-full">
                <h3 className="text-white font-bold tracking-widest uppercase text-sm">Excluir Lançamento</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Este lançamento faz parte de um grupo (parcelamento ou recorrência). O que deseja excluir?
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => executeDelete(transactionToDelete, 'only')} className="bg-white/5 hover:bg-rose-500/20 text-white hover:text-rose-400 p-3 text-xs uppercase tracking-widest transition-colors text-left border border-white/5">
                    Somente este ({(transactionToDelete?.date ? new Date(transactionToDelete.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'Sem data')})
                  </button>
                  <button onClick={() => executeDelete(transactionToDelete, 'future')} className="bg-white/5 hover:bg-rose-500/20 text-white hover:text-rose-400 p-3 text-xs uppercase tracking-widest transition-colors text-left border border-white/5">
                    Este e os futuros
                  </button>
                  <button onClick={() => executeDelete(transactionToDelete, 'all')} className="bg-white/5 hover:bg-rose-500/20 text-white hover:text-rose-400 p-3 text-xs uppercase tracking-widest transition-colors text-left border border-white/5">
                    Todos (incluindo anteriores)
                  </button>
                </div>
                <button onClick={() => setTransactionToDelete(null)} className="mt-2 text-white/40 hover:text-white text-xs uppercase tracking-widest p-2 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#050505] border border-white/10 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <button 
              onClick={() => setIsFormOpen(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <TransactionForm 
              onAdd={addTransaction}
              categories={computedCategories}
              transactions={Object.values(data.transactions || {})}
              cards={data.cards || {}}
              people={data.people || {}}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
              onClose={() => setIsFormOpen(false)}
              userName="Você"
            />
          </div>
        </div>
      )}

      {payingTxId && data.transactions[payingTxId] && (
        <ConfirmPaymentModal
          transaction={data.transactions[payingTxId]}
          cards={data.cards || {}}
          people={data.people || {}}
          onConfirm={confirmPayment}
          onCancel={() => setPayingTxId(null)}
        />
      )}

      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          categories={computedCategories}
          cards={data.cards || {}}
          people={data.people || {}}
          onSave={updateTransaction}
          onClose={() => setEditingTx(null)}
        />
      )}

      <AnimatePresence>
        {isAppMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAppMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 bg-[#080808] border-r border-white/10 h-full flex flex-col z-10 shadow-2xl"
            >
              <div className="h-20 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                     <Scale className="w-5 h-5 text-black -rotate-12" />
                   </div>
                   <h2 className="font-bold text-lg tracking-tight uppercase text-white">Menu</h2>
                </div>
                <button onClick={() => setIsAppMenuOpen(false)} className="text-white/40 hover:text-white p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                <button 
                  onClick={() => { toggleNotifications(); setIsAppMenuOpen(false); }} 
                  className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${notificationsEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:bg-white/5'}`}
                >
                  {notificationsEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />} 
                  Notificações
                </button>
                
                <button 
                  onClick={() => { setShowSecurity(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors"
                >
                  <Shield className="w-4 h-4" /> Biometria
                </button>
                <button 
                  onClick={() => { setShowLogs(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Registros
                </button>


                <button 
                  onClick={() => { setShowMemory(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors"
                >
                  <Database className="w-4 h-4" /> Memória
                </button>
                <button 
                  onPointerDown={() => {
                    (window as any).adminPressTimer = setTimeout(() => {
                      const code = window.prompt('Código de Administrador:');
                      if (code === '4107' || code === '4701') {
                        localStorage.setItem('fintrack_username', '4107');
                        setUserName('4107');
                        setIsAppMenuOpen(false);
                        alert('Modo Administrador ativado.');
                      }
                    }, 1500);
                  }}
                  onPointerUp={() => clearTimeout((window as any).adminPressTimer)}
                  onPointerLeave={() => clearTimeout((window as any).adminPressTimer)}
                  onClick={() => { setShowDevices(true); setIsAppMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors select-none"
                >
                  <Smartphone className="w-4 h-4" /> Aparelhos
                </button>


              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showSecurity && <SecuritySettingsModal onClose={() => setShowSecurity(false)} />}

      {showMemory && (
        <MemoryModal 
          onClose={() => setShowMemory(false)}
          isAdmin={userName === '4107' || userName === '4701'}
          onRestore={(backupData) => {
            const newData = { ...data, ...backupData };
            setData(newData);
            setRemoteData(newData);
          }}
        />
      )}
      {showLogs && <AuditLogsModal onClose={() => setShowLogs(false)} logs={data.logs || {}} />}

      {showDevices && (
        <DevicesModal 
          onClose={() => setShowDevices(false)} 
          devices={data.devices || {}} 
          currentDeviceId={deviceId}
          onAuthorize={(id) => {
            const newDevices = { ...data.devices };
            newDevices[id] = { ...newDevices[id], status: 'authorized' };
            const newData = { ...data, devices: newDevices };
            setData(newData);
            setRemoteData(newData);
          }}
          onRegisterSelf={async (name) => {
            const latestData = await getRemoteData();
            const newDevices = { ...(latestData.devices || {}) };
            const { type, name: detectedDeviceName } = detectDevice();
            
            newDevices[deviceId] = {
              id: deviceId,
              userName: name,
              deviceName: detectedDeviceName,
              deviceType: type,
              status: 'authorized',
              requestedAt: Date.now()
            };
            const newData = { ...latestData, devices: newDevices };
            setData(newData);
            setRemoteData(newData);
            localStorage.setItem('fintrack_username', name);
            setUserName(name);
          }}
          onRemove={(id) => {
            const newDevices = { ...data.devices };
            delete newDevices[id];
            const newData = { ...data, devices: newDevices };
            setData(newData);
            setRemoteData(newData);
          }}
        />
      )}

    </div>
  );
};
