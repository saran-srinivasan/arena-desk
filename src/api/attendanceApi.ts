import { get, post } from './client';
import type { AttendanceRecord } from '../types';

export const attendanceApi = {
  getByBatchAndDate: (batchId: string, date: string) => get<AttendanceRecord[]>(`/attendance/batch/${batchId}/date/${date}`),
  mark: (dto: any) => post<AttendanceRecord>('/attendance', dto),
  bulkMark: (dto: any) => post<AttendanceRecord[]>('/attendance/bulk', dto),
};
