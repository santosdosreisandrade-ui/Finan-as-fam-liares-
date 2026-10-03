const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

if (!content.includes('AuditLog')) {
  const auditLogCode = `
export interface AuditLog {
  id: string;
  timestamp: number;
  userName: string;
  action: 'created' | 'updated' | 'deleted';
  entityType: string;
  entityName: string;
  details?: string;
}
`;
  content = content.replace("export interface LocalData {", auditLogCode + "\nexport interface LocalData {");
  content = content.replace("insurances?: Record<string, Insurance>;", "insurances?: Record<string, Insurance>;\n  logs?: Record<string, AuditLog>;");
}
fs.writeFileSync('src/types.ts', content);
