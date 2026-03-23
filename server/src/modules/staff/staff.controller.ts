import { Request, Response } from 'express';
import { staffService } from './staff.service';

export class StaffController {
  async list(_req: Request, res: Response) {
    const staff = await staffService.list();
    res.json(staff);
  }

  async getById(req: Request, res: Response) {
    const staff = await staffService.getById(req.params.id as string);
    res.json(staff);
  }

  async create(req: Request, res: Response) {
    const staff = await staffService.create(req.body);
    res.status(201).json(staff);
  }

  async update(req: Request, res: Response) {
    const staff = await staffService.update(req.params.id as string, req.body);
    res.json(staff);
  }

  // DBS
  async getDbs(req: Request, res: Response) {
    const dbs = await staffService.getDbs(req.params.id as string);
    res.json(dbs);
  }

  async upsertDbs(req: Request, res: Response) {
    const dbs = await staffService.upsertDbs(req.params.id as string, req.body);
    res.json(dbs);
  }

  // Qualifications
  async getQualifications(req: Request, res: Response) {
    const quals = await staffService.getQualifications(req.params.id as string);
    res.json(quals);
  }

  async createQualification(req: Request, res: Response) {
    const qual = await staffService.createQualification(req.params.id as string, req.body);
    res.status(201).json(qual);
  }

  async deleteQualification(req: Request, res: Response) {
    await staffService.deleteQualification(req.params.id as string, req.params.qualId as string);
    res.status(204).send();
  }

  // Training
  async getTraining(req: Request, res: Response) {
    const records = await staffService.getTraining(req.params.id as string);
    res.json(records);
  }

  async createTraining(req: Request, res: Response) {
    const record = await staffService.createTraining(req.params.id as string, req.body);
    res.status(201).json(record);
  }

  async deleteTraining(req: Request, res: Response) {
    await staffService.deleteTraining(req.params.id as string, req.params.trainingId as string);
    res.status(204).send();
  }

  // Shifts
  async getShifts(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    const shifts = await staffService.getShifts(
      req.params.id as string,
      startDate as string | undefined,
      endDate as string | undefined,
    );
    res.json(shifts);
  }

  async createShift(req: Request, res: Response) {
    const shift = await staffService.createShift(req.params.id as string, req.body);
    res.status(201).json(shift);
  }

  async deleteShift(req: Request, res: Response) {
    await staffService.deleteShift(req.params.id as string, req.params.shiftId as string);
    res.status(204).send();
  }
}

export const staffController = new StaffController();
