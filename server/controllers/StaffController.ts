import type { Request, Response, NextFunction } from 'express';
import { staffService } from '../services/StaffService.ts';

export class StaffController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await staffService.getAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await staffService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await staffService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await staffService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await staffService.delete(req.params.id);
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  }
}

export const staffController = new StaffController();
