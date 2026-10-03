const fs = require('fs');
let content = fs.readFileSync('src/components/TransactionList.tsx', 'utf8');

// Add imports
if (!content.includes('PersonName')) {
  content = content.replace("import { Trash2, Edit2, ShieldAlert, CheckCircle2, MoreVertical, CreditCard, Repeat, ShieldCheck } from 'lucide-react';", "import { Trash2, Edit2, ShieldAlert, CheckCircle2, MoreVertical, CreditCard, Repeat, ShieldCheck } from 'lucide-react';\nimport { PersonName, parsePersonName } from './PersonName';");
}

const target = "{tx.paidBy && tx.status !== 'pending' && <><span className=\"text-white/20\"> • </span><span>{people[tx.paidBy]?.name || tx.paidBy}</span></>}";
const replacement = `{tx.paidBy && tx.status !== 'pending' && (
            <>
              <span className="text-white/20"> • </span>
              {people[tx.paidBy] ? (
                <span className="px-1.5 py-[1px] rounded border border-current text-[9px] uppercase tracking-widest font-bold" style={{ color: parsePersonName(people[tx.paidBy].name).color || '#888' }}>
                  <PersonName rawName={people[tx.paidBy].name} />
                </span>
              ) : (
                <span>{tx.paidBy}</span>
              )}
            </>
          )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/TransactionList.tsx', content);
