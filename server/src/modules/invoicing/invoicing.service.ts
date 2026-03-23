import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class InvoicingService {
  // Fee Schedules
  async listFeeSchedules() {
    return prisma.feeSchedule.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createFeeSchedule(data: {
    name: string;
    sessionType: string;
    rate: number;
    effectiveFrom: string;
    effectiveUntil?: string;
  }) {
    return prisma.feeSchedule.create({
      data: {
        name: data.name,
        sessionType: data.sessionType,
        rate: new Decimal(data.rate),
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : undefined,
      },
    });
  }

  async updateFeeSchedule(id: string, data: Record<string, unknown>) {
    const updateData = { ...data };
    if (updateData.rate) updateData.rate = new Decimal(updateData.rate as number);
    if (updateData.effectiveFrom) updateData.effectiveFrom = new Date(updateData.effectiveFrom as string);
    if (updateData.effectiveUntil) updateData.effectiveUntil = new Date(updateData.effectiveUntil as string);
    return prisma.feeSchedule.update({ where: { id }, data: updateData });
  }

  // Funded Hours
  async listFundedHours() {
    return prisma.fundedHours.findMany({
      include: { child: { select: { firstName: true, lastName: true } } },
    });
  }

  async getFundedHours(childId: string) {
    return prisma.fundedHours.findUnique({ where: { childId } });
  }

  async upsertFundedHours(childId: string, data: {
    entitlementType: string;
    weeklyHours: number;
    termStart: string;
    termEnd: string;
    fundingReference?: string;
  }) {
    return prisma.fundedHours.upsert({
      where: { childId },
      create: {
        childId,
        entitlementType: data.entitlementType,
        weeklyHours: data.weeklyHours,
        termStart: new Date(data.termStart),
        termEnd: new Date(data.termEnd),
        fundingReference: data.fundingReference,
      },
      update: {
        entitlementType: data.entitlementType,
        weeklyHours: data.weeklyHours,
        termStart: new Date(data.termStart),
        termEnd: new Date(data.termEnd),
        fundingReference: data.fundingReference,
      },
    });
  }

  // Invoices
  async listInvoices(filters?: { status?: string; parentId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.parentId) where.parentId = filters.parentId;

    return prisma.invoice.findMany({
      where,
      include: {
        parent: { select: { firstName: true, lastName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async getInvoice(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        parent: true,
        createdBy: { select: { staffProfile: { select: { firstName: true, lastName: true } } } },
        items: {
          include: {
            child: { select: { firstName: true, lastName: true } },
            feeSchedule: { select: { name: true } },
          },
        },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!invoice) throw new AppError(404, 'Invoice not found');
    return invoice;
  }

  async createInvoice(createdById: string, data: {
    parentId: string;
    issueDate: string;
    dueDate: string;
    periodStart: string;
    periodEnd: string;
    notes?: string;
    items: Array<{
      childId: string;
      feeScheduleId?: string;
      description: string;
      quantity: number;
      unitPrice: number;
      isFundedDeduction?: boolean;
    }>;
  }) {
    // Generate invoice number
    const setting = await prisma.nurserySetting.findUnique({ where: { key: 'invoice_next_number' } });
    const nextNum = parseInt(setting?.value || '1', 10);
    const prefix = (await prisma.nurserySetting.findUnique({ where: { key: 'invoice_prefix' } }))?.value || 'INV';
    const year = new Date().getFullYear();
    const invoiceNumber = `${prefix}-${year}-${String(nextNum).padStart(4, '0')}`;

    // Calculate totals
    let subtotal = 0;
    let fundedDeduction = 0;
    const itemsData = data.items.map((item) => {
      const total = item.quantity * item.unitPrice;
      if (item.isFundedDeduction) {
        fundedDeduction += Math.abs(total);
      } else {
        subtotal += total;
      }
      return {
        childId: item.childId,
        feeScheduleId: item.feeScheduleId,
        description: item.description,
        quantity: new Decimal(item.quantity),
        unitPrice: new Decimal(item.unitPrice),
        total: new Decimal(total),
        isFundedDeduction: item.isFundedDeduction ?? false,
      };
    });

    const totalAmount = subtotal - fundedDeduction;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        parentId: data.parentId,
        createdById,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        subtotal: new Decimal(subtotal),
        fundedDeduction: new Decimal(fundedDeduction),
        total: new Decimal(totalAmount),
        notes: data.notes,
        items: { create: itemsData },
      },
      include: {
        items: true,
        parent: { select: { firstName: true, lastName: true } },
      },
    });

    // Increment invoice number
    await prisma.nurserySetting.update({
      where: { key: 'invoice_next_number' },
      data: { value: String(nextNum + 1) },
    });

    return invoice;
  }

  async recordPayment(invoiceId: string, data: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new AppError(404, 'Invoice not found');

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: new Decimal(data.amount),
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Update invoice paid amount and status
    const newPaidAmount = Number(invoice.paidAmount) + data.amount;
    const totalDue = Number(invoice.total);
    let status = invoice.status;

    if (newPaidAmount >= totalDue) {
      status = 'PAID';
    } else if (newPaidAmount > 0) {
      status = 'PARTIALLY_PAID';
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: new Decimal(newPaidAmount),
        paidDate: status === 'PAID' ? new Date() : undefined,
        status,
      },
    });

    return payment;
  }

  async updateInvoiceStatus(id: string, status: string) {
    return prisma.invoice.update({ where: { id }, data: { status } });
  }
}

export const invoicingService = new InvoicingService();
