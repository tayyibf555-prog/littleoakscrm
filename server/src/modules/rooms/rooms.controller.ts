import { Request, Response } from 'express';
import { roomsService } from './rooms.service';

export class RoomsController {
  async list(_req: Request, res: Response) {
    const rooms = await roomsService.list();
    res.json(rooms);
  }

  async getById(req: Request, res: Response) {
    const room = await roomsService.getById(req.params.id as string);
    res.json(room);
  }

  async create(req: Request, res: Response) {
    const room = await roomsService.create(req.body);
    res.status(201).json(room);
  }

  async update(req: Request, res: Response) {
    const room = await roomsService.update(req.params.id as string, req.body);
    res.json(room);
  }
}

export const roomsController = new RoomsController();
