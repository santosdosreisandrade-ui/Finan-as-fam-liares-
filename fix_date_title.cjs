const fs = require('fs');
let content = fs.readFileSync('src/components/DateInput.tsx', 'utf8');

content = content.replace(
  "required?: boolean;",
  "required?: boolean;\n  title?: string;"
);

content = content.replace(
  "required \n}) => {",
  "required, \n  title\n}) => {"
);

content = content.replace(
  "required={required}",
  "required={required}\n        title={title}"
);

fs.writeFileSync('src/components/DateInput.tsx', content);
