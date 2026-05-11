import { pricingRuleRepository } from '../repositories/PricingRuleRepository.ts';
import type { PricingRule, CreatePricingRuleDto, UpdatePricingRuleDto } from '../types/index.ts';
import { NotFoundError, ValidationError, ConflictError } from '../types/index.ts';

export class PricingRuleService {
  async getAll(): Promise<PricingRule[]> {
    return pricingRuleRepository.findAll();
  }

  async getById(id: string): Promise<PricingRule> {
    const rule = await pricingRuleRepository.findById(id);
    if (!rule) throw new NotFoundError('PricingRule', id);
    return rule;
  }

  async create(dto: CreatePricingRuleDto): Promise<PricingRule> {
    if (!dto.sport) throw new ValidationError('Sport is required');
    if (dto.hourlyRate == null || dto.hourlyRate <= 0) throw new ValidationError('Hourly rate must be positive');

    // Check uniqueness
    const existing = await pricingRuleRepository.findAll();
    if (existing.some(r => r.sport === dto.sport)) {
      throw new ConflictError(`Pricing rule for sport ${dto.sport} already exists`);
    }

    const id = `pr-${Date.now()}`;
    return pricingRuleRepository.create(id, dto);
  }

  async update(id: string, dto: UpdatePricingRuleDto): Promise<PricingRule> {
    const existing = await pricingRuleRepository.findById(id);
    if (!existing) throw new NotFoundError('PricingRule', id);
    return pricingRuleRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await pricingRuleRepository.findById(id);
    if (!existing) throw new NotFoundError('PricingRule', id);
    return pricingRuleRepository.delete(id);
  }
}

export const pricingRuleService = new PricingRuleService();
