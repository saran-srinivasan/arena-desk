import { get } from './client';
import type { Resource } from '../types';

export const resourceApi = {
  getAll: () => get<Resource[]>('/resources'),
  getById: (id: string) => get<Resource>(`/resources/${id}`),
};
