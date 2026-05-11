import type { Request, Response, NextFunction } from 'express';
import { coachService } from '../services/CoachService.ts';

export class CoachController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const coaches = await coachService.getAll();
      res.json({ success: true, data: coaches });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const coach = await coachService.getById(req.params.id);
      res.json({ success: true, data: coach });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const coach = await coachService.create(req.body);
      res.status(201).json({ success: true, data: coach });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const coach = await coachService.update(req.params.id, req.body);
      res.json({ success: true, data: coach });
    } catch (err) { next(err); }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const coach = await coachService.deactivate(req.params.id);
      res.json({ success: true, data: coach });
    } catch (err) { next(err); }
  }

  async getPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const performance = await coachService.getPerformance(req.params.id);
      res.json({ success: true, data: performance });
    } catch (err) { next(err); }
  }
}

export const coachController = new CoachController();
