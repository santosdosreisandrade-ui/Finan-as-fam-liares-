const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert applyDataChange if not there
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
}

const replacer = (funcName, replacement) => {
  const funcStart = content.indexOf('const ' + funcName + ' =');
  if (funcStart === -1) return;
  const setIdx = content.indexOf('setData(newData);', funcStart);
  const remoteIdx = content.indexOf('setRemoteData(newData);', setIdx);
  if (setIdx !== -1 && remoteIdx !== -1 && (remoteIdx - setIdx < 150)) {
    content = content.substring(0, setIdx) + replacement + content.substring(remoteIdx + 'setRemoteData(newData);'.length);
  } else {
    // reverse order
    const remoteIdx2 = content.indexOf('setRemoteData(newData);', funcStart);
    const setIdx2 = content.indexOf('setData(newData);', remoteIdx2);
    if (remoteIdx2 !== -1 && setIdx2 !== -1 && (setIdx2 - remoteIdx2 < 150)) {
      content = content.substring(0, remoteIdx2) + replacement + content.substring(setIdx2 + 'setData(newData);'.length);
    }
  }
};

replacer("addSavings", "applyDataChange(newData, 'Criou', 'Cofre', saving.name || saving.bank || 'Item');\n");
replacer("updateSavings", "applyDataChange(newData, 'Editou', 'Cofre', saving.name || saving.bank || 'Item');\n");
replacer("deleteSavings", "applyDataChange(newData, 'Excluiu', 'Cofre', data.savings?.[id]?.name || data.savings?.[id]?.bank || 'Item');\n");

replacer("addHousing", "applyDataChange(newData, 'Criou', 'Imóveis', housing.name || 'Item');\n");
replacer("updateHousing", "applyDataChange(newData, 'Editou', 'Imóveis', housing.name || 'Item');\n");
replacer("deleteHousing", "applyDataChange(newData, 'Excluiu', 'Imóveis', data.housings?.[id]?.name || 'Item');\n");

replacer("addInsurance", "applyDataChange(newData, 'Criou', 'Seguros', insurance.company || 'Item');\n");
replacer("updateInsurance", "applyDataChange(newData, 'Editou', 'Seguros', insurance.company || 'Item');\n");
replacer("deleteInsurance", "applyDataChange(newData, 'Excluiu', 'Seguros', data.insurances?.[id]?.company || 'Item');\n");

replacer("addMachine", "applyDataChange(newData, 'Criou', 'Máquinas', machine.name || 'Item');\n");
replacer("updateMachine", "applyDataChange(newData, 'Editou', 'Máquinas', machine.name || 'Item');\n");
replacer("deleteMachine", "applyDataChange(newData, 'Excluiu', 'Máquinas', data.machines?.[id]?.name || 'Item');\n");

replacer("addPerson", "applyDataChange(newData, 'Criou', 'Pessoas/Pets', person.name || 'Item');\n");
replacer("updatePerson", "applyDataChange(newData, 'Editou', 'Pessoas/Pets', person.name || 'Item');\n");
replacer("deletePerson", "applyDataChange(newData, 'Excluiu', 'Pessoas/Pets', data.people?.[id]?.name || 'Item');\n");

replacer("addCard", "applyDataChange(newData, 'Criou', 'Cartões', card.nickname || 'Item');\n");
replacer("updateCard", "applyDataChange(newData, 'Editou', 'Cartões', card.nickname || 'Item');\n");
replacer("deleteCard", "applyDataChange(newData, 'Excluiu', 'Cartões', data.cards?.[id]?.nickname || 'Item');\n");

replacer("addTransaction", "applyDataChange(newData, 'Criou', 'Transação', txs.length > 1 ? txs.length + ' Transações' : txs[0]?.description || 'Item');\n");
replacer("updateTransaction", "applyDataChange(newData, 'Editou', 'Transação', updatedTx.description || 'Item');\n");
replacer("deleteTransaction", "applyDataChange(newData, 'Excluiu', 'Transação', transaction?.description || 'Item');\n");

replacer("updateBudget", "applyDataChange(newData, 'Editou', 'Orçamento', category || 'Item');\n");
replacer("addCategory", "applyDataChange(newData, 'Criou', 'Categoria', category || 'Item');\n");
replacer("removeCategory", "applyDataChange(newData, 'Excluiu', 'Categoria', category || 'Item');\n");


fs.writeFileSync('src/App.tsx', content);
