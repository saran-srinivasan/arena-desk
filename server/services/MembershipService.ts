import { membershipRepository } from '../repositories/MembershipRepository.ts';
import { membershipPlanRepository } from '../repositories/MembershipPlanRepository.ts';
import { customerRepository } from '../repositories/CustomerRepository.ts';
import type { Membership, CreateMembershipDto, UpdateMembershipDto } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class MembershipService {
  async getAll(): Promise<Membership[]> {
    return membershipRepository.findAll();
  }

  async getByCustomer(customerId: string): Promise<Membership[]> {
    return membershipRepository.findByCustomer(customerId);
  }

  async getById(id: string): Promise<Membership> {
    const membership = await membershipRepository.findById(id);
    if (!membership) throw new NotFoundError('Membership', id);
    return membership;
  }

  async create(dto: CreateMembershipDto): Promise<Membership> {
    // Validate customer exists
    const customer = await customerRepository.findById(dto.customerId);
    if (!customer) throw new NotFoundError('Customer', dto.customerId);

    // Validate plan exists & active
    const plan = await membershipPlanRepository.findById(dto.planId);
    if (!plan) throw new NotFoundError('MembershipPlan', dto.planId);
    if (!plan.isActive) throw new ValidationError('Selected plan is no longer active');

    // Calculate end date from plan duration
    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);
    const endDateStr = endDate.toISOString().slice(0, 10);

    // Update customer type to Member
    await customerRepository.update(customer.id, { customerType: 'Member' });

    const id = `mem-${Date.now()}`;
    return membershipRepository.create(id, dto, endDateStr);
  }

  async update(id: string, dto: UpdateMembershipDto): Promise<Membership> {
    const existing = await membershipRepository.findById(id);
    if (!existing) throw new NotFoundError('Membership', id);
    return membershipRepository.update(id, dto);
  }

  async cancel(id: string): Promise<Membership> {
    const existing = await membershipRepository.findById(id);
    if (!existing) throw new NotFoundError('Membership', id);
    if (existing.status === 'Cancelled') throw new ValidationError('Membership is already cancelled');
    return membershipRepository.cancel(id);
  }

  async getExpiring(days: number = 30): Promise<Membership[]> {
    return membershipRepository.findExpiring(days);
  }
}

export const membershipService = new MembershipService();
