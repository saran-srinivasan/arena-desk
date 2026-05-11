import type { Request, Response, NextFunction } from 'express';
import { resourceService } from '../services/ResourceService.ts';

export class ResourceController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await resourceService.getAll();
      res.json({ success: true, data: resources });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await resourceService.getById(req.params.id);
      res.json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }

  async getBySport(req: Request, res: Response, next: NextFunction) {
    try {
      const sport = req.query.sport as string;
      if (!sport) {
        return this.getAll(req, res, next);
      }
      const resources = await resourceService.getBySport(sport);
      res.json({ success: true, data: resources });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await resourceService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await resourceService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await resourceService.delete(req.params.id);
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  }
}

export const resourceController = new ResourceController();
