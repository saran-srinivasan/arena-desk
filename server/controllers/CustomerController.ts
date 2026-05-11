import type { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/CustomerService.ts';

export class CustomerController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string | undefined;
      const type = req.query.type as string | undefined;
      let customers;
      if (q) {
        customers = await customerService.search(q);
      } else if (type) {
        customers = await customerService.getByType(type as any);
      } else {
        customers = await customerService.getAll();
      }
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await customerService.delete(req.params.id);
      res.json({ success: true, data: { message: 'Customer deleted' } });
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
