import type { Request, Response, NextFunction } from 'express';
import { batchService } from '../services/BatchService.ts';

export class BatchController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const batches = await batchService.getAll();
      res.json({ success: true, data: batches });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const batch = await batchService.getById(req.params.id);
      res.json({ success: true, data: batch });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const batch = await batchService.create(req.body);
      res.status(201).json({ success: true, data: batch });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const batch = await batchService.update(req.params.id, req.body);
      res.json({ success: true, data: batch });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await batchService.delete(req.params.id);
      res.json({ success: true, data: { message: 'Batch deleted' } });
    } catch (err) { next(err); }
  }
}

export const batchController = new BatchController();
