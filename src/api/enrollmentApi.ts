import { get, post, patch } from './client';
import type { StudentEnrollment } from '../types';

export const enrollmentApi = {
  getByBatch: (batchId: string) => get<StudentEnrollment[]>(`/enrollments/batch/${batchId}`),
  getByStudent: (studentId: string) => get<StudentEnrollment[]>(`/enrollments/student/${studentId}`),
  create: (dto: any) => post<StudentEnrollment>('/enrollments', dto),
  drop: (id: string) => patch<StudentEnrollment>(`/enrollments/${id}/drop`, {}),
  updatePayment: (id: string, paymentStatus: string) => patch<StudentEnrollment>(`/enrollments/${id}/payment`, { paymentStatus }),
};
