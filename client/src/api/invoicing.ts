import api from './client';
import type { FeeSchedule, FundedHours, Invoice, Payment } from '@/types/invoicing';

export interface ListInvoicesParams {
  status?: string;
  parentId?: string;
}

export interface CreateFeeScheduleData {
  name: string;
  sessionType: string;
  hoursPerSession: number;
  ratePerSession: number;
  ratePerHour: number;
  isActive?: boolean;
}

export interface UpdateFeeScheduleData extends Partial<CreateFeeScheduleData> {}

export interface UpsertFundedHoursData {
  hoursPerWeek: number;
  fundingType: string;
  termStartDate: string;
  termEndDate: string;
}

export interface CreateInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  feeScheduleId?: string;
}

export interface CreateInvoiceData {
  parentId: string;
  childId: string;
  periodStart: string;
  periodEnd: string;
  items: CreateInvoiceItem[];
  notes?: string;
  dueDate: string;
}

export interface RecordPaymentData {
  amount: number;
  paymentMethod: string;
  reference?: string;
  paidDate: string;
}

export const invoicingApi = {
  // Fee Schedules
  listFeeSchedules: () =>
    api.get<FeeSchedule[]>('/billing/fee-schedules'),

  createFeeSchedule: (data: CreateFeeScheduleData) =>
    api.post<FeeSchedule>('/billing/fee-schedules', data),

  updateFeeSchedule: (id: string, data: UpdateFeeScheduleData) =>
    api.put<FeeSchedule>(`/billing/fee-schedules/${id}`, data),

  // Funded Hours
  listFundedHours: () =>
    api.get<FundedHours[]>('/billing/funded-hours'),

  getFundedHours: (childId: string) =>
    api.get<FundedHours>(`/billing/funded-hours/${childId}`),

  upsertFundedHours: (childId: string, data: UpsertFundedHoursData) =>
    api.put<FundedHours>(`/billing/funded-hours/${childId}`, data),

  // Invoices
  listInvoices: (params?: ListInvoicesParams) =>
    api.get<Invoice[]>('/billing/invoices', { params }),

  getInvoice: (id: string) =>
    api.get<Invoice>(`/billing/invoices/${id}`),

  createInvoice: (data: CreateInvoiceData) =>
    api.post<Invoice>('/billing/invoices', data),

  voidInvoice: (id: string) =>
    api.delete<Invoice>(`/billing/invoices/${id}`),

  sendInvoice: (id: string) =>
    api.post<Invoice>(`/billing/invoices/${id}/send`),

  recordPayment: (invoiceId: string, data: RecordPaymentData) =>
    api.post<Payment>(`/billing/invoices/${invoiceId}/payments`, data),
};
