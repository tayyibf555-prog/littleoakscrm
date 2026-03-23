import { Request, Response } from 'express';
import { dailyDiaryService } from './daily-diary.service';

export class DailyDiaryController {
  async list(req: Request, res: Response) {
    const { date, childId, entryType } = req.query;
    const entries = await dailyDiaryService.list({
      date: date as string | undefined,
      childId: childId as string | undefined,
      entryType: entryType as string | undefined,
    });
    res.json(entries);
  }

  async getById(req: Request, res: Response) {
    const entry = await dailyDiaryService.getById(req.params.id as string);
    res.json(entry);
  }

  async getByChild(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    const entries = await dailyDiaryService.getByChild(
      req.params.childId as string,
      startDate as string | undefined,
      endDate as string | undefined,
    );
    res.json(entries);
  }

  async create(req: Request, res: Response) {
    const entry = await dailyDiaryService.create(req.user!.userId, req.body);
    res.status(201).json(entry);
  }

  async update(req: Request, res: Response) {
    const entry = await dailyDiaryService.update(req.params.id as string, req.body);
    res.json(entry);
  }

  async delete(req: Request, res: Response) {
    await dailyDiaryService.delete(req.params.id as string);
    res.status(204).send();
  }
}

export const dailyDiaryController = new DailyDiaryController();
