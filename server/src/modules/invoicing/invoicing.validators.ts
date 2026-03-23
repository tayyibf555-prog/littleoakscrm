import { z } from 'zod';

export const createInvoiceSchema = z.object({
  parentId: z.string().min(1),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      childId: z.string().min(1),
      feeScheduleId: z.string().optional(),
      description: z.string().min(1),
      quantity: z.number().positive(),
      unitPrice: z.number().min(0),
      isFundedDeduction: z.boolean().default(false),
    }),
  ).min(1, 'At least one line item is required'),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'CHILDCARE_VOUCHER', 'TAX_FREE_CHILDCARE', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const createFeeScheduleSchema = z.object({
  name: z.string().min(1),
  sessionType: z.enum(['FULL_DAY', 'HALF_DAY_AM', 'HALF_DAY_PM', 'HOURLY']),
  rate: z.number().positive(),
  effectiveFrom: z.string().min(1),
  effectiveUntil: z.string().optional(),
});

export const updateFundedHoursSchema = z.object({
  entitlementType: z.enum(['UNIVERSAL_15', 'EXTENDED_30', 'TWO_YEAR_OLD_15', 'NONE']),
  weeklyHours: z.number().min(0),
  termStart: z.string().min(1),
  termEnd: z.string().min(1),
  fundingReference: z.string().optional(),
});
