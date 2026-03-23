import { Request, Response } from 'express';
import { childrenService } from './children.service';

export class ChildrenController {
  async list(req: Request, res: Response) {
    const { status, roomId, search } = req.query;
    const children = await childrenService.list({
      status: status as string | undefined,
      roomId: roomId as string | undefined,
      search: search as string | undefined,
    });
    res.json(children);
  }

  async getById(req: Request, res: Response) {
    const child = await childrenService.getById(req.params.id as string);
    res.json(child);
  }

  async create(req: Request, res: Response) {
    const child = await childrenService.create(req.body);
    res.status(201).json(child);
  }

  async update(req: Request, res: Response) {
    const child = await childrenService.update(req.params.id as string, req.body);
    res.json(child);
  }

  // Medical
  async getMedical(req: Request, res: Response) {
    const medical = await childrenService.getMedical(req.params.id as string);
    res.json(medical);
  }

  async updateMedical(req: Request, res: Response) {
    const medical = await childrenService.updateMedical(req.params.id as string, req.body);
    res.json(medical);
  }

  // Contacts
  async getContacts(req: Request, res: Response) {
    const contacts = await childrenService.getContacts(req.params.id as string);
    res.json(contacts);
  }

  async createContact(req: Request, res: Response) {
    const contact = await childrenService.createContact(req.params.id as string, req.body);
    res.status(201).json(contact);
  }

  async updateContact(req: Request, res: Response) {
    const contact = await childrenService.updateContact(
      req.params.id as string,
      req.params.contactId as string,
      req.body,
    );
    res.json(contact);
  }

  async deleteContact(req: Request, res: Response) {
    await childrenService.deleteContact(req.params.id as string, req.params.contactId as string);
    res.status(204).send();
  }

  // Consents
  async getConsents(req: Request, res: Response) {
    const consents = await childrenService.getConsents(req.params.id as string);
    res.json(consents);
  }

  async updateConsents(req: Request, res: Response) {
    const consents = await childrenService.updateConsents(req.params.id as string, req.body);
    res.json(consents);
  }
}

export const childrenController = new ChildrenController();
