import { get, post, put, del } from './client';
import type { PricingRule, CreatePricingRuleDto, UpdatePricingRuleDto } from '../types';

export const pricingRuleApi = {
  getAll: () => get<PricingRule[]>('/pricing-rules'),
  getById: (id: string) => get<PricingRule>(`/pricing-rules/${id}`),
  create: (data: CreatePricingRuleDto) => post<PricingRule>('/pricing-rules', data),
  update: (id: string, data: UpdatePricingRuleDto) => put<PricingRule>(`/pricing-rules/${id}`, data),
  delete: (id: string) => del<{ deleted: boolean }>(`/pricing-rules/${id}`),
};
