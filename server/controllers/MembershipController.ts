import type { Request, Response, NextFunction } from 'express';
import { membershipService } from '../services/MembershipService.ts';

export class MembershipController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const memberships = await membershipService.getAll();
      res.json({ success: true, data: memberships });
    } catch (err) { next(err); }
  }

  async getByCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const memberships = await membershipService.getByCustomer(req.params.customerId);
      res.json({ success: true, data: memberships });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await membershipService.getById(req.params.id);
      res.json({ success: true, data: membership });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await membershipService.create(req.body);
      res.status(201).json({ success: true, data: membership });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await membershipService.update(req.params.id, req.body);
      res.json({ success: true, data: membership });
    } catch (err) { next(err); }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await membershipService.cancel(req.params.id);
      res.json({ success: true, data: membership });
    } catch (err) { next(err); }
  }
}

export const membershipController = new MembershipController();
