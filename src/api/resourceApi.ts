import { get, post, put, del } from './client';
import type { Resource, CreateResourceDto, UpdateResourceDto } from '../types';

export const resourceApi = {
  getAll: () => get<Resource[]>('/resources'),
  getById: (id: string) => get<Resource>(`/resources/${id}`),
  create: (data: CreateResourceDto) => post<Resource>('/resources', data),
  update: (id: string, data: UpdateResourceDto) => put<Resource>(`/resources/${id}`, data),
  delete: (id: string) => del<{ deleted: boolean }>(`/resources/${id}`),
};
