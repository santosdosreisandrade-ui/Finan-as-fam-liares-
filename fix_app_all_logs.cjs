const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The pattern is:
// setData(newData);
// setRemoteData(newData);
// inside various functions.
// We can use regex to replace them based on the function they are in.

const replacements = [
  { func: "addHousing", type: "Imóveis", name: "housing.name", action: "Criou" },
  { func: "updateHousing", type: "Imóveis", name: "housing.name", action: "Editou" },
  { func: "deleteHousing", type: "Imóveis", name: "data.housings[id]?.name", action: "Excluiu" },
  
  { func: "addInsurance", type: "Seguros", name: "insurance.company", action: "Criou" },
  { func: "updateInsurance", type: "Seguros", name: "insurance.company", action: "Editou" },
  { func: "deleteInsurance", type: "Seguros", name: "data.insurances[id]?.company", action: "Excluiu" },
  
  { func: "addMachine", type: "Máquinas", name: "machine.name", action: "Criou" },
  { func: "updateMachine", type: "Máquinas", name: "machine.name", action: "Editou" },
  { func: "deleteMachine", type: "Máquinas", name: "data.machines[id]?.name", action: "Excluiu" },

  { func: "addPerson", type: "Pessoas/Pets", name: "person.name", action: "Criou" },
  { func: "updatePerson", type: "Pessoas/Pets", name: "person.name", action: "Editou" },
  { func: "deletePerson", type: "Pessoas/Pets", name: "data.people[id]?.name", action: "Excluiu" },

  { func: "addCard", type: "Cartões", name: "card.nickname", action: "Criou" },
  { func: "updateCard", type: "Cartões", name: "card.nickname", action: "Editou" },
  { func: "deleteCard", type: "Cartões", name: "data.cards[id]?.nickname", action: "Excluiu" },
  
  { func: "addTransaction", type: "Transação", name: "(txs.length > 1 ? txs.length + ' Transações' : txs[0]?.description)", action: "Criou" },
  { func: "updateTransaction", type: "Transação", name: "updatedTx.description", action: "Editou" },
  { func: "deleteTransaction", type: "Transação", name: "transaction?.description", action: "Excluiu" },
  
  { func: "updateBudget", type: "Orçamento", name: "category", action: "Editou" },
  { func: "addCategory", type: "Categoria", name: "category", action: "Criou" },
  { func: "removeCategory", type: "Categoria", name: "category", action: "Excluiu" },
];

for (const r of replacements) {
  // Find the function declaration
  const funcDecl = `const ${r.func} =`;
  const idx = content.indexOf(funcDecl);
  if (idx === -1) continue;
  
  // Find the next setData(newData)
  const setIdx = content.indexOf('setData(newData);', idx);
  if (setIdx === -1) continue;
  
  // Find if it has setRemoteData nearby
  const remoteIdx = content.indexOf('setRemoteData(newData);', setIdx);
  if (remoteIdx !== -1 && remoteIdx < setIdx + 200) { // arbitrary bound
    // We replace the block with applyDataChange
    const targetToReplace = content.substring(setIdx, remoteIdx + 'setRemoteData(newData);'.length);
    const replacement = `applyDataChange(newData, '${r.action}', '${r.type}', ${r.name} || 'Item Desconhecido');`;
    content = content.replace(targetToReplace, replacement);
  } else {
    // maybe inverted order
    const remoteIdx2 = content.indexOf('setRemoteData(newData);', idx);
    const setIdx2 = content.indexOf('setData(newData);', remoteIdx2);
    if (remoteIdx2 !== -1 && setIdx2 !== -1 && setIdx2 < remoteIdx2 + 200) {
      const targetToReplace = content.substring(remoteIdx2, setIdx2 + 'setData(newData);'.length);
      const replacement = `applyDataChange(newData, '${r.action}', '${r.type}', ${r.name} || 'Item Desconhecido');`;
      content = content.replace(targetToReplace, replacement);
    }
  }
}

// Ensure updateSavings and deleteSavings and addSavings are correct
// addSavings
const addSavingsIdx = content.indexOf('const addSavings =');
if (addSavingsIdx !== -1) {
    const setIdx = content.indexOf('setData(newData);', addSavingsIdx);
    const remoteIdx = content.indexOf('setRemoteData(newData);', setIdx);
    if (setIdx !== -1 && remoteIdx !== -1) {
        content = content.replace(content.substring(setIdx, remoteIdx + 23), `applyDataChange(newData, 'Criou', 'Cofre', saving.name || saving.bank);`);
    }
}

fs.writeFileSync('src/App.tsx', content);
