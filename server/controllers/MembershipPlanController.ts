import type { Request, Response, NextFunction } from 'express';
import { membershipPlanService } from '../services/MembershipPlanService.ts';

export class MembershipPlanController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await membershipPlanService.getAll();
      res.json({ success: true, data: plans });
    } catch (err) { next(err); }
  }

  async getActive(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await membershipPlanService.getActive();
      res.json({ success: true, data: plans });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await membershipPlanService.getById(req.params.id);
      res.json({ success: true, data: plan });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await membershipPlanService.create(req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await membershipPlanService.update(req.params.id, req.body);
      res.json({ success: true, data: plan });
    } catch (err) { next(err); }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await membershipPlanService.deactivate(req.params.id);
      res.json({ success: true, data: plan });
    } catch (err) { next(err); }
  }
}

export const membershipPlanController = new MembershipPlanController();
