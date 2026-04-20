import type { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/BookingService.ts';
import type { BookingStatus } from '../types/index.ts';

export class BookingController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: {
        status?: BookingStatus;
        date?: string;
        resourceId?: string;
        customerId?: string;
      } = {};

      if (req.query.status) filters.status = req.query.status as BookingStatus;
      if (req.query.date) filters.date = req.query.date as string;
      if (req.query.resourceId) filters.resourceId = req.query.resourceId as string;
      if (req.query.customerId) filters.customerId = req.query.customerId as string;

      const bookings = await bookingService.getAll(
        Object.keys(filters).length > 0 ? filters : undefined,
      );
      res.json({ success: true, data: bookings });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getById(req.params.id);
      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.create(req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.update(req.params.id, req.body);
      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.cancel(req.params.id);
      res.json({ success: true, data: booking, message: 'Booking cancelled' });
    } catch (err) {
      next(err);
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.checkIn(req.params.id);
      res.json({ success: true, data: booking, message: 'Checked in successfully' });
    } catch (err) {
      next(err);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.complete(req.params.id);
      res.json({ success: true, data: booking, message: 'Session completed' });
    } catch (err) {
      next(err);
    }
  }

  async checkConflicts(req: Request, res: Response, next: NextFunction) {
    try {
      const { proposed, ignoreBookingId } = req.body;
      const conflicts = await bookingService.checkConflicts(proposed, ignoreBookingId);
      res.json({ success: true, data: conflicts });
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
