import type { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/EnrollmentService.ts';

export class EnrollmentController {
  async getByBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollments = await enrollmentService.getByBatch(req.params.batchId);
      res.json({ success: true, data: enrollments });
    } catch (err) { next(err); }
  }

  async getByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollments = await enrollmentService.getByStudent(req.params.studentId);
      res.json({ success: true, data: enrollments });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await enrollmentService.enroll(req.body);
      res.status(201).json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  }

  async drop(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await enrollmentService.drop(req.params.id);
      res.json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  }

  async updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await enrollmentService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
      res.json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  }
}

export const enrollmentController = new EnrollmentController();
