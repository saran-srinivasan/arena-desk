import { get, post, put, patch } from './client';
import type { Coach, CoachPerformance } from '../types';

export const coachApi = {
  getAll: () => get<Coach[]>('/coaches'),
  getById: (id: string) => get<Coach>(`/coaches/${id}`),
  getPerformance: (id: string) => get<CoachPerformance>(`/coaches/${id}/performance`),
  create: (dto: any) => post<Coach>('/coaches', dto),
  update: (id: string, dto: any) => put<Coach>(`/coaches/${id}`, dto),
  deactivate: (id: string) => patch<Coach>(`/coaches/${id}/deactivate`, {}),
};
