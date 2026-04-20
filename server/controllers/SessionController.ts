import type { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/SessionService.ts';
import { ValidationError } from '../types/index.ts';

export class SessionController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await sessionService.getAll();
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  async extend(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { additionalMinutes } = req.body;

      if (typeof additionalMinutes !== 'number') {
        throw new ValidationError('additionalMinutes must be a number');
      }

      const session = await sessionService.extend(bookingId, additionalMinutes);
      res.json({ success: true, data: session, message: `Extended by ${additionalMinutes} minutes` });
    } catch (err) {
      next(err);
    }
  }
}

export const sessionController = new SessionController();
