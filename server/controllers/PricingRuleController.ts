import type { Request, Response, NextFunction } from 'express';
import { pricingRuleService } from '../services/PricingRuleService.ts';

export class PricingRuleController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pricingRuleService.getAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pricingRuleService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pricingRuleService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pricingRuleService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await pricingRuleService.delete(req.params.id);
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  }
}

export const pricingRuleController = new PricingRuleController();
