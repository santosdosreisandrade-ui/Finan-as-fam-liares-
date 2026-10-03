const fs = require('fs');
let content = fs.readFileSync('src/components/DateInput.tsx', 'utf8');

// Add useRef
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// Add ref declaration
content = content.replace(
  "const [displayValue, setDisplayValue] = useState('');",
  "const [displayValue, setDisplayValue] = useState('');\n  const dateInputRef = useRef<HTMLInputElement>(null);"
);

// Add onClick handler
content = content.replace(
  /<div className="absolute right-3 w-5 h-5 flex items-center justify-center text-white\/50 hover:text-white">/,
  '<div \n        className="absolute right-3 w-5 h-5 flex items-center justify-center text-white/50 hover:text-white cursor-pointer" \n        onClick={() => {\n          try {\n            dateInputRef.current?.showPicker();\n          } catch (e) { /* ignore */ }\n        }}\n      >'
);

// Add ref to input
content = content.replace(
  /<input\s*type="date"/,
  '<input\n          ref={dateInputRef}\n          type="date"'
);

fs.writeFileSync('src/components/DateInput.tsx', content);
