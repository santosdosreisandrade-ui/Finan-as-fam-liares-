const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Activity with ClipboardList
content = content.replace(/Activity,/g, 'Activity, ClipboardList, Scale,');
content = content.replace(/<Activity className="w-4 h-4" \/> Planejamento/g, '<ClipboardList className="w-4 h-4" /> Planejamento');
content = content.replace(/<Activity className="w-5 h-5" \/>/g, '<ClipboardList className="w-5 h-5" />');

// Replace Heart with Scale and text
content = content.replace(/<Heart className="w-4 h-4" \/> Saúde Financeira/g, '<Scale className="w-4 h-4 -rotate-12" /> Equilíbrio');
content = content.replace(/<Heart className="w-5 h-5" \/>/g, '<Scale className="w-5 h-5 -rotate-12" />');
content = content.replace(/"Saúde"/g, '"Equilíbrio"');
content = content.replace(/>Saúde</g, '>Equilíbrio<');

// Update Version
content = content.replace(/V02\.00/g, 'V02.01');

fs.writeFileSync('src/App.tsx', content);
