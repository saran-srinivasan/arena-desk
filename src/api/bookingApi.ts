import { get, post, patch } from './client';
import type { Booking, Conflict, ProposedBooking } from '../types';

interface CreateBookingDto {
  customerId: string;
  sport: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdBy: string;
  priceCents?: number;
}

interface UpdateBookingDto {
  customerId?: string;
  sport?: string;
  resourceId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  priceCents?: number;
}

export const bookingApi = {
  getAll: (filters?: { status?: string; date?: string; resourceId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.date) params.set('date', filters.date);
    if (filters?.resourceId) params.set('resourceId', filters.resourceId);
    const qs = params.toString();
    return get<Booking[]>(`/bookings${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => get<Booking>(`/bookings/${id}`),

  create: (dto: CreateBookingDto) => post<Booking>('/bookings', dto),

  update: (id: string, dto: UpdateBookingDto) => patch<Booking>(`/bookings/${id}`, dto),

  cancel: (id: string) => post<Booking>(`/bookings/${id}/cancel`),

  checkIn: (id: string) => post<Booking>(`/bookings/${id}/checkin`),

  complete: (id: string) => post<Booking>(`/bookings/${id}/complete`),

  checkConflicts: (proposed: ProposedBooking, ignoreBookingId?: string) =>
    post<Conflict[]>('/bookings/check-conflicts', { proposed, ignoreBookingId }),
};
