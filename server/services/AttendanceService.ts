import { attendanceRepository } from '../repositories/AttendanceRepository.ts';
import type { Attendance, CreateAttendanceDto, BulkAttendanceDto } from '../types/index.ts';
import { ValidationError } from '../types/index.ts';

export class AttendanceService {
  async getByBatchAndDate(batchId: string, date: string): Promise<Attendance[]> {
    if (!batchId || !date) throw new ValidationError('Batch ID and date are required');
    return attendanceRepository.findByBatchAndDate(batchId, date);
  }

  async getByEnrollment(enrollmentId: string): Promise<Attendance[]> {
    return attendanceRepository.findByEnrollment(enrollmentId);
  }

  async getByBatch(batchId: string): Promise<Attendance[]> {
    return attendanceRepository.findByBatch(batchId);
  }

  async mark(dto: CreateAttendanceDto): Promise<Attendance> {
    if (!dto.enrollmentId) throw new ValidationError('Enrollment ID is required');
    if (!dto.batchId) throw new ValidationError('Batch ID is required');
    if (!dto.date) throw new ValidationError('Date is required');
    if (!dto.markedBy) throw new ValidationError('Marked by is required');
    return attendanceRepository.markAttendance(dto);
  }

  async bulkMark(dto: BulkAttendanceDto): Promise<Attendance[]> {
    if (!dto.batchId) throw new ValidationError('Batch ID is required');
    if (!dto.date) throw new ValidationError('Date is required');
    if (!dto.markedBy) throw new ValidationError('Marked by is required');
    if (!dto.records?.length) throw new ValidationError('At least one attendance record required');
    return attendanceRepository.bulkMark(dto);
  }

  async getStats(batchId: string) {
    return attendanceRepository.getAttendanceStats(batchId);
  }
}

export const attendanceService = new AttendanceService();
