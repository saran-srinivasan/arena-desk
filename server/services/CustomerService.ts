import { customerRepository } from '../repositories/CustomerRepository.ts';
import type { Customer, CreateCustomerDto } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class CustomerService {
  async getAll(): Promise<Customer[]> {
    return customerRepository.findAll();
  }

  async getById(id: string): Promise<Customer> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer', id);
    return customer;
  }

  async search(q: string): Promise<Customer[]> {
    if (!q || q.trim().length === 0) return customerRepository.findAll();
    return customerRepository.search(q.trim());
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    // Validate required fields
    if (!dto.name?.trim()) throw new ValidationError('Name is required');
    if (!dto.phone?.trim()) throw new ValidationError('Phone is required');
    if (!dto.email?.trim()) throw new ValidationError('Email is required');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Check email uniqueness
    const existing = await customerRepository.findByEmail(dto.email);
    if (existing) {
      throw new ValidationError(`A customer with email '${dto.email}' already exists`);
    }

    const id = `c-${Date.now()}`;
    return customerRepository.create(id, dto);
  }
}

export const customerService = new CustomerService();
