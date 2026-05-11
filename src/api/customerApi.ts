import { get, post, put, del } from './client';
import type { Customer } from '../types';

interface CreateCustomerDto {
  name: string;
  phone: string;
  email: string;
  customerType?: string;
  preferredSport: string;
  photoUrl?: string;
}

interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  customerType?: string;
  preferredSport?: string;
  photoUrl?: string;
}

export const customerApi = {
  getAll: () => get<Customer[]>('/customers'),
  getById: (id: string) => get<Customer>(`/customers/${id}`),
  search: (q: string) => get<Customer[]>(`/customers?q=${encodeURIComponent(q)}`),
  getByType: (type: string) => get<Customer[]>(`/customers?type=${encodeURIComponent(type)}`),
  create: (dto: CreateCustomerDto) => post<Customer>('/customers', dto),
  update: (id: string, dto: UpdateCustomerDto) => put<Customer>(`/customers/${id}`, dto),
  delete: (id: string) => del<{ message: string }>(`/customers/${id}`),
};
