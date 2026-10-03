const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('applyDataChange')) {
  const applyDataChangeCode = `
  const applyDataChange = (newData: LocalData, action: 'Criou' | 'Editou' | 'Excluiu', entityType: string, entityName: string) => {
    const userName = localStorage.getItem('fintrack_username') || 'Desconhecido';
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
  `;
  content = content.replace("export default function App() {\n  const [data, setData] = useState<LocalData>({ transactions: {} });", "export default function App() {\n  const [data, setData] = useState<LocalData>({ transactions: {} });\n" + applyDataChangeCode);
  
  // Now replace all setData(newData) + setRemoteData(newData) with applyDataChange
  
  // Savings
  content = content.replace(`    setData(newData);\n    setRemoteData(newData);\n  };\n\n  const deleteSavings`, `    applyDataChange(newData, 'Criou', 'Cofre', saving.name || saving.bank);\n  };\n\n  const deleteSavings`);
  content = content.replace(`    setData(newData);\n    setRemoteData(newData);\n  };\n\n  const updateSavings =`, `    applyDataChange(newData, 'Editou', 'Cofre', saving.name || saving.bank);\n  };\n\n  const updateSavings =`); // actually wait, update is the one above delete
  // Let's use string replaces precisely.
}
fs.writeFileSync('src/App.tsx', content);
