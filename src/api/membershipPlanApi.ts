import { get, post, put, patch } from './client';
import type { MembershipPlan } from '../types';

export const membershipPlanApi = {
  getAll: () => get<MembershipPlan[]>('/membership-plans'),
  getActive: () => get<MembershipPlan[]>('/membership-plans/active'),
  getById: (id: string) => get<MembershipPlan>(`/membership-plans/${id}`),
  create: (dto: any) => post<MembershipPlan>('/membership-plans', dto),
  update: (id: string, dto: any) => put<MembershipPlan>(`/membership-plans/${id}`, dto),
  deactivate: (id: string) => patch<MembershipPlan>(`/membership-plans/${id}/deactivate`, {}),
};
