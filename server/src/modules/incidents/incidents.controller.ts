import { Request, Response } from 'express';
import { incidentsService } from './incidents.service';

export class IncidentsController {
  async list(req: Request, res: Response) {
    const { status, incidentType, startDate, endDate } = req.query;
    const incidents = await incidentsService.list({
      status: status as string | undefined,
      incidentType: incidentType as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });
    res.json(incidents);
  }

  async getById(req: Request, res: Response) {
    const incident = await incidentsService.getById(req.params.id as string);
    res.json(incident);
  }

  async create(req: Request, res: Response) {
    const incident = await incidentsService.create(req.user!.userId, req.body);
    res.status(201).json(incident);
  }

  async signoff(req: Request, res: Response) {
    const incident = await incidentsService.signoff(
      req.params.id as string,
      req.user!.userId,
      req.body.signoffNotes,
    );
    res.json(incident);
  }

  async notifyParent(req: Request, res: Response) {
    const incident = await incidentsService.notifyParent(
      req.params.id as string,
      req.body.parentNotifiedBy,
    );
    res.json(incident);
  }
}

export const incidentsController = new IncidentsController();
