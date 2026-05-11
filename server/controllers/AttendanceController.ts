import type { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/AttendanceService.ts';

export class AttendanceController {
  async getByBatchAndDate(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await attendanceService.getByBatchAndDate(req.params.batchId, req.params.date);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  }

  async mark(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await attendanceService.mark(req.body);
      res.status(201).json({ success: true, data: record });
    } catch (err) { next(err); }
  }

  async bulkMark(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await attendanceService.bulkMark(req.body);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  }
}

export const attendanceController = new AttendanceController();
