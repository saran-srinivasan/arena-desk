import { sessionRepository } from '../repositories/SessionRepository.ts';
import { bookingRepository } from '../repositories/BookingRepository.ts';
import type { ActiveSession } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class SessionService {
  async getAll(): Promise<ActiveSession[]> {
    return sessionRepository.findAll();
  }

  async getByBookingId(bookingId: string): Promise<ActiveSession> {
    const session = await sessionRepository.findByBookingId(bookingId);
    if (!session) throw new NotFoundError('Session', bookingId);
    return session;
  }

  async extend(bookingId: string, additionalMinutes: number): Promise<ActiveSession> {
    if (additionalMinutes <= 0) {
      throw new ValidationError('Additional minutes must be positive');
    }

    const session = await this.getByBookingId(bookingId);
    const currentEnd = new Date(session.endTime);
    const newEnd = new Date(currentEnd.getTime() + additionalMinutes * 60 * 1000);
    const newEndISO = newEnd.toISOString();

    // Update both session and booking end times
    await sessionRepository.updateEndTime(bookingId, newEndISO);
    await bookingRepository.update(bookingId, { endTime: newEndISO });

    return this.getByBookingId(bookingId);
  }
}

export const sessionService = new SessionService();
