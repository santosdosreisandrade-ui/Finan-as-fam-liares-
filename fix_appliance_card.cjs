const fs = require('fs');

let content = fs.readFileSync('src/components/FamilyManager.tsx', 'utf8');

const oldInfo = `<div className={infoContainerClasses}>
                <p>Marca: <span className={spanClasses}>{v.brand}</span></p>
                <p>Modelo: <span className={spanClasses}>{v.model}</span></p>
                <p>Cor: <span className={spanClasses}>{v.color}</span></p>
                <p>Placa: <span className={spanClasses}>{v.plate}</span></p>

                {v.machineType && <p>Tipo: <span className={spanClasses}>{v.machineType}</span></p>}
                {v.purchaseDate && <p>Compra: <span className={spanClasses}>{v.purchaseDate.split('-').reverse().join('/')}</span></p>}
                {v.warranty && <p>Garantia: <span className={spanClasses}>{v.warranty}</span></p>}

                <p>IPVA: <span className={spanClasses}>{v.ipvaExempt ? 'Isento' : (v.ipvaValue ? \`R$ \${formatCurrency(v.ipvaValue)}\` : 'N/A')}</span></p>
                <p>Licenciamento: <span className={spanClasses}>{v.licensingValue ? \`R$ \${formatCurrency(v.licensingValue)}\` : 'N/A'}</span></p>
                            </div>`;

const newInfo = `<div className={infoContainerClasses}>
                <p>Marca: <span className={spanClasses}>{v.brand}</span></p>
                
                {v.category === 'appliance' ? (
                  <>
                    {v.purchaseDate && <p>Compra: <span className={spanClasses}>{v.purchaseDate.split('-').reverse().join('/')}</span></p>}
                    <p>Garantia Loja: <span className={spanClasses}>{v.purchaseDate ? \`Até \${getCalculatedDate(v.purchaseDate, 90, 0)}\` : '90 dias'}</span></p>
                    <p>Garantia Fábrica: <span className={spanClasses}>{v.purchaseDate ? \`Até \${getCalculatedDate(v.purchaseDate, 0, 1)}\` : '1 ano'}</span></p>
                    {v.extendedWarranty && v.extendedWarrantyTime && (
                      <p>Garantia Estendida: <span className={spanClasses}>{v.extendedWarrantyTime}</span></p>
                    )}
                  </>
                ) : (
                  <>
                    <p>Modelo: <span className={spanClasses}>{v.model}</span></p>
                    <p>Cor: <span className={spanClasses}>{v.color}</span></p>
                    <p>Placa: <span className={spanClasses}>{v.plate}</span></p>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs flex flex-col gap-1 justify-between text-white/50">
                      <span>IPVA: {v.ipvaExempt ? 'Isento' : (v.ipvaValue ? formatCurrency(v.ipvaValue) : 'Não informado')}</span>
                      <span>LIC: {v.licensingValue ? formatCurrency(v.licensingValue) : 'Não informado'}</span>
                    </div>
                  </>
                )}
              </div>`;

content = content.replace(oldInfo, newInfo);
fs.writeFileSync('src/components/FamilyManager.tsx', content);

