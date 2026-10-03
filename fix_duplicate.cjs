const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsManager.tsx', 'utf8');

content = content.replace("const [name, setName] = useState('');\n  const [name,\n      bank, setBank] = useState('');", "const [name, setName] = useState('');\n  const [bank, setBank] = useState('');");

content = content.replace("const [editName, setEditName] = useState('');\n  const [editName, setEditName] = useState('');\n  const [editBank, setEditBank] = useState('');", "const [editName, setEditName] = useState('');\n  const [editBank, setEditBank] = useState('');");

fs.writeFileSync('src/components/SavingsManager.tsx', content);
