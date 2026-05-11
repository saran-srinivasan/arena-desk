import { get, post, put, del } from './client';
import type { CoachingBatch } from '../types';

export const batchApi = {
  getAll: () => get<CoachingBatch[]>('/batches'),
  getById: (id: string) => get<CoachingBatch>(`/batches/${id}`),
  create: (dto: any) => post<CoachingBatch>('/batches', dto),
  update: (id: string, dto: any) => put<CoachingBatch>(`/batches/${id}`, dto),
  delete: (id: string) => del<{ message: string }>(`/batches/${id}`),
};
