import { membershipPlanRepository } from '../repositories/MembershipPlanRepository.ts';
import type { MembershipPlan, CreateMembershipPlanDto, UpdateMembershipPlanDto } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class MembershipPlanService {
  async getAll(): Promise<MembershipPlan[]> {
    return membershipPlanRepository.findAll();
  }

  async getActive(): Promise<MembershipPlan[]> {
    return membershipPlanRepository.findActive();
  }

  async getById(id: string): Promise<MembershipPlan> {
    const plan = await membershipPlanRepository.findById(id);
    if (!plan) throw new NotFoundError('MembershipPlan', id);
    return plan;
  }

  async create(dto: CreateMembershipPlanDto): Promise<MembershipPlan> {
    if (!dto.name?.trim()) throw new ValidationError('Plan name is required');
    if (!dto.durationMonths || dto.durationMonths <= 0) throw new ValidationError('Duration must be positive');
    if (!dto.price || dto.price <= 0) throw new ValidationError('Price must be positive');
    if (!dto.sportsAccess || dto.sportsAccess.length === 0) throw new ValidationError('At least one sport access required');

    const id = `mp-${Date.now()}`;
    return membershipPlanRepository.create(id, dto);
  }

  async update(id: string, dto: UpdateMembershipPlanDto): Promise<MembershipPlan> {
    const existing = await membershipPlanRepository.findById(id);
    if (!existing) throw new NotFoundError('MembershipPlan', id);
    return membershipPlanRepository.update(id, dto);
  }

  async deactivate(id: string): Promise<MembershipPlan> {
    const existing = await membershipPlanRepository.findById(id);
    if (!existing) throw new NotFoundError('MembershipPlan', id);
    return membershipPlanRepository.deactivate(id);
  }
}

export const membershipPlanService = new MembershipPlanService();
