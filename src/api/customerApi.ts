import { get, post } from './client';
import type { Customer } from '../types';

interface CreateCustomerDto {
  name: string;
  phone: string;
  email: string;
  preferredSport: string;
  photoUrl?: string;
}

export const customerApi = {
  getAll: () => get<Customer[]>('/customers'),
  getById: (id: string) => get<Customer>(`/customers/${id}`),
  search: (q: string) => get<Customer[]>(`/customers?q=${encodeURIComponent(q)}`),
  create: (dto: CreateCustomerDto) => post<Customer>('/customers', dto),
};
