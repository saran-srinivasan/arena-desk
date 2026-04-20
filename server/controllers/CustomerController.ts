import type { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/CustomerService.ts';

export class CustomerController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string | undefined;
      const customers = q
        ? await customerService.search(q)
        : await customerService.getAll();
      res.json({ success: true, data: customers });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(req.params.id);
      res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
