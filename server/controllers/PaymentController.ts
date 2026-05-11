import type { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/PaymentService.ts';

export class PaymentController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getAll();
      res.json({ success: true, data: payments });
    } catch (err) { next(err); }
  }

  async getByCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getByCustomer(req.params.customerId);
      res.json({ success: true, data: payments });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.create(req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.updateStatus(req.params.id, req.body.status);
      res.json({ success: true, data: payment });
    } catch (err) { next(err); }
  }
}

export const paymentController = new PaymentController();
