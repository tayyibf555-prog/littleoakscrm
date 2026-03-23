import { Request, Response } from 'express';
import { invoicingService } from './invoicing.service';

export class InvoicingController {
  // Fee Schedules
  async listFeeSchedules(_req: Request, res: Response) {
    const schedules = await invoicingService.listFeeSchedules();
    res.json(schedules);
  }

  async createFeeSchedule(req: Request, res: Response) {
    const schedule = await invoicingService.createFeeSchedule(req.body);
    res.status(201).json(schedule);
  }

  async updateFeeSchedule(req: Request, res: Response) {
    const schedule = await invoicingService.updateFeeSchedule(req.params.id as string, req.body);
    res.json(schedule);
  }

  // Funded Hours
  async listFundedHours(_req: Request, res: Response) {
    const hours = await invoicingService.listFundedHours();
    res.json(hours);
  }

  async getFundedHours(req: Request, res: Response) {
    const hours = await invoicingService.getFundedHours(req.params.childId as string);
    res.json(hours);
  }

  async upsertFundedHours(req: Request, res: Response) {
    const hours = await invoicingService.upsertFundedHours(req.params.childId as string, req.body);
    res.json(hours);
  }

  // Invoices
  async listInvoices(req: Request, res: Response) {
    const { status, parentId } = req.query;
    const invoices = await invoicingService.listInvoices({
      status: status as string | undefined,
      parentId: parentId as string | undefined,
    });
    res.json(invoices);
  }

  async getInvoice(req: Request, res: Response) {
    const invoice = await invoicingService.getInvoice(req.params.id as string);
    res.json(invoice);
  }

  async createInvoice(req: Request, res: Response) {
    const invoice = await invoicingService.createInvoice(req.user!.userId, req.body);
    res.status(201).json(invoice);
  }

  async recordPayment(req: Request, res: Response) {
    const payment = await invoicingService.recordPayment(req.params.id as string, req.body);
    res.status(201).json(payment);
  }

  async voidInvoice(req: Request, res: Response) {
    const invoice = await invoicingService.updateInvoiceStatus(req.params.id as string, 'VOID');
    res.json(invoice);
  }

  async sendInvoice(req: Request, res: Response) {
    // TODO: Send email via Resend
    const invoice = await invoicingService.updateInvoiceStatus(req.params.id as string, 'SENT');
    res.json(invoice);
  }
}

export const invoicingController = new InvoicingController();
