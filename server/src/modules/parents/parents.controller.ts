import { Request, Response } from 'express';
import { parentsService } from './parents.service';

export class ParentsController {
  async list(_req: Request, res: Response) {
    const parents = await parentsService.list();
    res.json(parents);
  }

  async getById(req: Request, res: Response) {
    const parent = await parentsService.getById(req.params.id as string);
    res.json(parent);
  }

  async create(req: Request, res: Response) {
    const parent = await parentsService.create(req.body);
    res.status(201).json(parent);
  }

  async update(req: Request, res: Response) {
    const parent = await parentsService.update(req.params.id as string, req.body);
    res.json(parent);
  }

  async linkToChild(req: Request, res: Response) {
    const link = await parentsService.linkToChild(req.params.id as string, req.body);
    res.status(201).json(link);
  }
}

export const parentsController = new ParentsController();
