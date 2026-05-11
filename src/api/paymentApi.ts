import { get, post, patch } from './client';
import type { Payment } from '../types';

export const paymentApi = {
  getAll: () => get<Payment[]>('/payments'),
  getByCustomer: (customerId: string) => get<Payment[]>(`/payments/customer/${customerId}`),
  create: (dto: any) => post<Payment>('/payments', dto),
  updateStatus: (id: string, status: string) => patch<Payment>(`/payments/${id}/status`, { status }),
};
