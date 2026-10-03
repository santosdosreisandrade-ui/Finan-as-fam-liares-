const fs = require('fs');
let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

// Fix PersonName imports
if (!content.includes('PersonName')) {
  content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';\nimport { PersonName } from './PersonName';");
} else {
  // Just make sure it's imported
  if (!content.includes("import { PersonName } from './PersonName';")) {
     content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';\nimport { PersonName } from './PersonName';");
  }
}

// Fix nested PersonNames
content = content.replace(/<PersonName rawName=<PersonName rawName=<PersonName rawName=\{person\.name\} \/> \/> \/>/g, "<PersonName rawName={person.name} />");
content = content.replace(/<PersonName rawName=<PersonName rawName=\{person\.name\} \/> \/>/g, "<PersonName rawName={person.name} />");

fs.writeFileSync('src/components/FamilyManager.tsx', content);
