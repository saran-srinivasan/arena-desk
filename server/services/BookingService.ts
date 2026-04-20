import { bookingRepository } from '../repositories/BookingRepository.ts';
import { customerRepository } from '../repositories/CustomerRepository.ts';
import { resourceRepository } from '../repositories/ResourceRepository.ts';
import { sessionRepository } from '../repositories/SessionRepository.ts';
import { conflictService } from './ConflictService.ts';
import type {
  Booking,
  BookingStatus,
  CreateBookingDto,
  UpdateBookingDto,
  Conflict,
  ProposedBooking,
} from '../types/index.ts';
import { NotFoundError, ValidationError, ConflictError } from '../types/index.ts';

export class BookingService {
  // ── Queries ───────────────────────────────────────────────
  async getAll(filters?: {
    status?: BookingStatus;
    date?: string;
    resourceId?: string;
    customerId?: string;
  }): Promise<Booking[]> {
    if (filters?.status) return bookingRepository.findByStatus(filters.status);
    if (filters?.date && filters?.resourceId) return bookingRepository.findByResource(filters.resourceId, filters.date);
    if (filters?.date) return bookingRepository.findByDate(filters.date);
    if (filters?.customerId) return bookingRepository.findByCustomer(filters.customerId);
    return bookingRepository.findAll();
  }

  async getById(id: string): Promise<Booking> {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError('Booking', id);
    return booking;
  }

  // ── Create ────────────────────────────────────────────────
  async create(dto: CreateBookingDto): Promise<Booking> {
    // Validate customer exists
    const customer = await customerRepository.findById(dto.customerId);
    if (!customer) throw new ValidationError(`Customer '${dto.customerId}' does not exist`);

    // Validate resource exists
    const resource = await resourceRepository.findById(dto.resourceId);
    if (!resource) throw new ValidationError(`Resource '${dto.resourceId}' does not exist`);

    // Validate resource supports the sport
    if (!resource.supportedSports.includes(dto.sport)) {
      throw new ValidationError(`Resource '${resource.name}' does not support ${dto.sport}`);
    }

    // Validate time range
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    if (startTime >= endTime) {
      throw new ValidationError('Start time must be before end time');
    }

    // Check conflicts
    const proposed: ProposedBooking = {
      resourceId: dto.resourceId,
      sport: dto.sport,
      startTime: dto.startTime,
      endTime: dto.endTime,
    };
    const conflicts = await conflictService.checkConflicts(proposed);
    if (conflicts.length > 0) {
      throw new ConflictError('Booking conflicts with existing reservations', conflicts);
    }

    // Generate ID
    const id = await bookingRepository.getNextId('BK');

    const booking: Booking = {
      id,
      customerId: customer.id,
      customerName: customer.name,
      sport: dto.sport,
      resourceId: resource.id,
      resourceName: resource.name,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: 'Confirmed',
      notes: dto.notes,
      createdBy: dto.createdBy,
      createdAt: new Date().toISOString(),
      priceCents: dto.priceCents ?? 0,
    };

    const created = await bookingRepository.create(booking);

    // Increment customer booking count
    await customerRepository.incrementBookingCount(customer.id);

    return created;
  }

  // ── Update ────────────────────────────────────────────────
  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const existing = await this.getById(id);

    // Cannot update cancelled/completed bookings
    if (existing.status === 'Cancelled' || existing.status === 'Completed') {
      throw new ValidationError(`Cannot update a ${existing.status.toLowerCase()} booking`);
    }

    // Build the merged booking for conflict checking
    const mergedResourceId = dto.resourceId ?? existing.resourceId;
    const mergedSport = dto.sport ?? existing.sport;
    const mergedStart = dto.startTime ?? existing.startTime;
    const mergedEnd = dto.endTime ?? existing.endTime;

    // Validate time range if changed
    if (new Date(mergedStart) >= new Date(mergedEnd)) {
      throw new ValidationError('Start time must be before end time');
    }

    // Validate resource if changed
    if (dto.resourceId) {
      const resource = await resourceRepository.findById(dto.resourceId);
      if (!resource) throw new ValidationError(`Resource '${dto.resourceId}' does not exist`);
      if (!resource.supportedSports.includes(mergedSport)) {
        throw new ValidationError(`Resource '${resource.name}' does not support ${mergedSport}`);
      }
    }

    // Validate customer if changed
    if (dto.customerId) {
      const customer = await customerRepository.findById(dto.customerId);
      if (!customer) throw new ValidationError(`Customer '${dto.customerId}' does not exist`);
    }

    // Check conflicts (ignoring self)
    const proposed: ProposedBooking = {
      resourceId: mergedResourceId,
      sport: mergedSport,
      startTime: mergedStart,
      endTime: mergedEnd,
    };
    const conflicts = await conflictService.checkConflicts(proposed, id);
    if (conflicts.length > 0) {
      throw new ConflictError('Updated booking conflicts with existing reservations', conflicts);
    }

    // Build patch with derived fields
    const patch: Partial<Booking> = { ...dto };
    if (dto.customerId) {
      const customer = (await customerRepository.findById(dto.customerId))!;
      patch.customerName = customer.name;
    }
    if (dto.resourceId) {
      const resource = (await resourceRepository.findById(dto.resourceId))!;
      patch.resourceName = resource.name;
    }

    const updated = await bookingRepository.update(id, patch);
    if (!updated) throw new NotFoundError('Booking', id);
    return updated;
  }

  // ── Status Transitions ────────────────────────────────────
  async cancel(id: string): Promise<Booking> {
    const booking = await this.getById(id);
    if (booking.status === 'Cancelled') {
      throw new ValidationError('Booking is already cancelled');
    }
    if (booking.status === 'Completed') {
      throw new ValidationError('Cannot cancel a completed booking');
    }

    await bookingRepository.updateStatus(id, 'Cancelled');

    // If there was an active session, remove it
    await sessionRepository.delete(id);

    return this.getById(id);
  }

  async checkIn(id: string): Promise<Booking> {
    const booking = await this.getById(id);
    if (booking.status !== 'Confirmed') {
      throw new ValidationError(`Cannot check in a booking with status '${booking.status}'`);
    }

    await bookingRepository.updateStatus(id, 'Active');

    // Create active session
    await sessionRepository.create({
      bookingId: booking.id,
      customerId: booking.customerId,
      customerName: booking.customerName,
      sport: booking.sport,
      resourceId: booking.resourceId,
      resourceName: booking.resourceName,
      startTime: new Date().toISOString(), // actual check-in time
      endTime: booking.endTime,
    });

    return this.getById(id);
  }

  async complete(id: string): Promise<Booking> {
    const booking = await this.getById(id);
    if (booking.status !== 'Active') {
      throw new ValidationError(`Cannot complete a booking with status '${booking.status}'`);
    }

    await bookingRepository.updateStatus(id, 'Completed');
    await sessionRepository.delete(id);

    return this.getById(id);
  }

  // ── Conflict Check (for API endpoint) ─────────────────────
  async checkConflicts(proposed: ProposedBooking, ignoreBookingId?: string): Promise<Conflict[]> {
    return conflictService.checkConflicts(proposed, ignoreBookingId);
  }
}

export const bookingService = new BookingService();
