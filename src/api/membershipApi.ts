import { get, post, put, patch } from './client';
import type { Membership } from '../types';

export const membershipApi = {
  getAll: () => get<Membership[]>('/memberships'),
  getByCustomer: (customerId: string) => get<Membership[]>(`/memberships/customer/${customerId}`),
  getById: (id: string) => get<Membership>(`/memberships/${id}`),
  create: (dto: any) => post<Membership>('/memberships', dto),
  update: (id: string, dto: any) => put<Membership>(`/memberships/${id}`, dto),
  cancel: (id: string) => patch<Membership>(`/memberships/${id}/cancel`, {}),
};
