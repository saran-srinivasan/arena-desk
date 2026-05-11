import { get, post, put, del } from './client';
import type { Staff, CreateStaffDto, UpdateStaffDto } from '../types';

export const staffApi = {
  getAll: () => get<Staff[]>('/staff'),
  getById: (id: string) => get<Staff>(`/staff/${id}`),
  create: (data: CreateStaffDto) => post<Staff>('/staff', data),
  update: (id: string, data: UpdateStaffDto) => put<Staff>(`/staff/${id}`, data),
  delete: (id: string) => del<{ deleted: boolean }>(`/staff/${id}`),
};
