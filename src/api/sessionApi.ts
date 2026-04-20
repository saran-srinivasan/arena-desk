import { get, post } from './client';
import type { ActiveSession } from '../types';

export const sessionApi = {
  getAll: () => get<ActiveSession[]>('/sessions'),

  extend: (bookingId: string, additionalMinutes: number) =>
    post<ActiveSession>(`/sessions/${bookingId}/extend`, { additionalMinutes }),
};
