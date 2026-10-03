export function formatCurrency(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return "0,00";
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
