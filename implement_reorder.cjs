const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

// Imports
content = content.replace(
  /import \{ (.*) \} from 'react';/,
  "import { $1, useRef } from 'react';"
);

// Add state for reorder
content = content.replace(
  /const \[isFormOpen, setIsFormOpen\] = useState\(false\);/,
  "const [isFormOpen, setIsFormOpen] = useState(false);\n  const [reorderMode, setReorderMode] = useState(false);\n  const longPressTimer = useRef<any>(null);\n  const [draggedId, setDraggedId] = useState<string | null>(null);"
);

// Reorder logic functions
const reorderFunctions = `
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setReorderMode(true);
    }, 800);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    
    const peopleList = Object.values(people).sort((a, b) => (a.order || 0) - (b.order || 0));
    const draggedIndex = peopleList.findIndex(p => p.id === draggedId);
    const targetIndex = peopleList.findIndex(p => p.id === targetId);
    
    const newList = [...peopleList];
    const [removed] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, removed);
    
    newList.forEach((p, index) => {
      if (p.order !== index) {
        onUpdatePerson({ ...p, order: index });
      }
    });
    setDraggedId(null);
  };
`;

content = content.replace(
  /const startEdit = \(person: Person\) => \{/,
  reorderFunctions + '\n  const startEdit = (person: Person) => {'
);

// Inject Touch events and map over sorted
content = content.replace(
  /\{Object\.values\(people\)\.map\(\(person\) => \{/,
  `{reorderMode && (
    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded text-emerald-400 text-sm flex justify-between items-center mb-4">
      <span>Modo de reordenação ativado. Arraste os cards.</span>
      <button onClick={() => setReorderMode(false)} className="px-3 py-1 bg-emerald-500/20 rounded font-bold uppercase tracking-widest text-[10px]">Concluir</button>
    </div>
  )}
  {Object.values(people).sort((a, b) => (a.order || 0) - (b.order || 0)).map((person) => {`
);

content = content.replace(
  /<div key=\{person\.id\} className=\{containerClasses\} style=\{person\.role === 'pet' \? getPetBackgroundStyle\(person\.species \|\| ''\) : \{\}\}>/,
  `<div key={person.id} className={containerClasses + (draggedId === person.id ? ' opacity-50' : '')} style={person.role === 'pet' ? getPetBackgroundStyle(person.species || '') : {}} onMouseDown={handleTouchStart} onMouseUp={handleTouchEnd} onMouseLeave={handleTouchEnd} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} draggable={reorderMode} onDragStart={(e) => handleDragStart(e, person.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, person.id)}>`
);

fs.writeFileSync('src/components/FamilyManager.tsx', content);
