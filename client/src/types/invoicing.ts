export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'VOID';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'CHILDCARE_VOUCHER' | 'TAX_FREE_CHILDCARE' | 'OTHER';

export interface FeeSchedule {
  id: string;
  name: string;
  sessionType: string;
  hoursPerSession: number;
  ratePerSession: number;
  ratePerHour: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FundedHours {
  id: string;
  childId: string;
  hoursPerWeek: number;
  fundingType: string;
  termStartDate: string;
  termEndDate: string;
  child?: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  feeScheduleId: string | null;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string | null;
  paidDate: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  parentId: string;
  childId: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  fundedHoursDeduction: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  sentAt: string | null;
  notes: string | null;
  parent?: { firstName: string; lastName: string; email: string };
  child?: { firstName: string; lastName: string };
  items?: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}
