const fs = require('fs');
let content = fs.readFileSync('src/lib/storage.ts', 'utf8');

// Update getRemoteData
const oldGet = `export const getRemoteData = async (): Promise<LocalData> => {
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
    
    return parsed;
  } catch (e) {
    console.error('Failed to parse remote data', e);
    return { transactions: {}, categories: DEFAULT_CATEGORIES };
  }
};`;

const newGet = `export const getRemoteData = async (): Promise<LocalData> => {
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
};`;

content = content.replace(oldGet, newGet);

// Update setRemoteData
const oldSet = `export const setRemoteData = async (data: LocalData): Promise<void> => {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error('Failed to save remote data', e);
  }
};`;

const newSet = `export const setRemoteData = async (data: LocalData): Promise<void> => {
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
};`;

content = content.replace(oldSet, newSet);

fs.writeFileSync('src/lib/storage.ts', content);
