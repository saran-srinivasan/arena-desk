import { paymentRepository } from '../repositories/PaymentRepository.ts';
import { customerRepository } from '../repositories/CustomerRepository.ts';
import type { Payment, CreatePaymentDto } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class PaymentService {
  async getAll(): Promise<Payment[]> {
    return paymentRepository.findAll();
  }

  async getByCustomer(customerId: string): Promise<Payment[]> {
    return paymentRepository.findByCustomer(customerId);
  }

  async getByReference(type: string, referenceId: string): Promise<Payment[]> {
    return paymentRepository.findByReference(type, referenceId);
  }

  async create(dto: CreatePaymentDto): Promise<Payment> {
    if (!dto.customerId) throw new ValidationError('Customer ID is required');
    if (!dto.type) throw new ValidationError('Payment type is required');
    if (!dto.referenceId) throw new ValidationError('Reference ID is required');
    if (!dto.amount || dto.amount <= 0) throw new ValidationError('Amount must be positive');
    if (!dto.method) throw new ValidationError('Payment method is required');

    const customer = await customerRepository.findById(dto.customerId);
    if (!customer) throw new NotFoundError('Customer', dto.customerId);

    const id = `pay-${Date.now()}`;
    return paymentRepository.create(id, dto);
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    const existing = await paymentRepository.findById(id);
    if (!existing) throw new NotFoundError('Payment', id);
    return paymentRepository.updateStatus(id, status);
  }
}

export const paymentService = new PaymentService();
