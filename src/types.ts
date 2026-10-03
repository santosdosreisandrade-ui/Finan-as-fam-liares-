export interface Card {
  id: string;
  nickname: string;
  lastFour?: string;
  brand?: string;
  holderName?: string;
  bank: string;
  dueDateType: 'fixed' | 'business_day';
  dueDateValue: number;
  limit?: number;
  alertEnabled?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  category: string;
  type: 'income' | 'expense';
  paidBy: string;
  updatedAt: number;
  deleted?: boolean;
  status?: 'paid' | 'pending';
  isRecurring?: boolean;
  recurrence?: 'weekly' | 'monthly' | 'yearly' | 'none' | 'fixed' | 'annual' | 'installments';
  installments?: number;
  installmentNumber?: number;
  paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash'; // Payment method used
  sourceId?: string; // Origin of the purchase (e.g. Card ID)
  interestAmount?: number; // Amount of interest paid in this transaction
  groupId?: string; // Group ID for recurring or installments
}

export interface PixKey {
  id: string;
  key: string;
  nickname: string;
  bank: string;
}

export interface Machine {
  id: string;
  name: string;
  brand: string;
  color: string;
  model: string;
  plate: string;
  machineType?: string;
  purchaseDate?: string;
  warranty?: string;
  ipvaValue?: number;
  ipvaExempt?: boolean;
  licensingValue?: number;
  category?: 'vehicle' | 'appliance';
  extendedWarranty?: boolean;
  extendedWarrantyTime?: string;
}

export interface Person {
  id: string;
  name: string;
  role?: 'family' | 'third_party' | 'pet';
  adoptionDate?: string;
  birthDate?: string;
  species?: string;
  cpf?: string;
  relationship?: string;
  pixKeys?: PixKey[];
  secretTheme?: 'fluminense';
  order?: number;
}

export interface Savings {
  id: string;
  name?: string;
  bank: string;
  initialAmount: number;
  interestRate: number;
  interestPeriod: 'monthly' | 'annual';
  startDate: string;
  maturityDate?: string;
  notes?: string;
  type?: 'savings' | 'stock';
  applicationType?: 'porquinho' | 'tesouro' | 'renda_fixa' | 'acoes' | 'outras';
  notifyUpdate?: boolean;
  ownerId?: string;
  dividends?: {id: string; date: string; amount: number}[];
}



export interface Housing {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  complement?: string;
  zipCode: string;
}

export interface Insurance {
  id: string;
  insuredName: string;
  beneficiaries: string;
  company: string;
  contact: string;
  contractNumber: string;
  type: string;
}



export interface Device {
  id: string;
  userName: string;
  deviceName?: string;
  deviceType?: 'smartphone' | 'tablet' | 'pc';
  status: 'pending' | 'authorized';
  requestedAt: number;
}
export interface AuditLog {
  id: string;
  timestamp: number;
  userName: string;
  deviceName?: string;
  deviceType?: 'smartphone' | 'tablet' | 'pc';
  action: 'created' | 'updated' | 'deleted';
  entityType: string;
  entityName: string;
  details?: string;
}

export interface LocalData {
  transactions: Record<string, Transaction>;
  categories?: string[];
  cards?: Record<string, Card>;
  people?: Record<string, Person>;
  savings?: Record<string, Savings>;
  budgets?: Record<string, number>;
  machines?: Record<string, Machine>;
  housings?: Record<string, Housing>;
  insurances?: Record<string, Insurance>;
  logs?: Record<string, AuditLog>;
  devices?: Record<string, Device>;
}
