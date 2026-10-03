const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const deviceCode = `
export interface Device {
  id: string;
  userName: string;
  status: 'pending' | 'authorized';
  requestedAt: number;
}
`;

content = content.replace("export interface AuditLog {", deviceCode + "export interface AuditLog {");
content = content.replace("logs?: Record<string, AuditLog>;", "logs?: Record<string, AuditLog>;\n  devices?: Record<string, Device>;");

fs.writeFileSync('src/types.ts', content);
