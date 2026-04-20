import { bookingRepository } from '../repositories/BookingRepository.ts';
import { resourceRepository } from '../repositories/ResourceRepository.ts';
import type { Booking, Conflict, ProposedBooking, SportType } from '../types/index.ts';

// Sports that share a single physical court space
const COURT_SPORTS: SportType[] = ['Cricket', 'Pickleball', 'Volleyball'];

/**
 * Server-side conflict detection.
 * Queries the database for overlapping bookings and checks for both
 * direct conflicts and cross-sport shared-group conflicts.
 */
export class ConflictService {
  /**
   * Check if a proposed booking conflicts with any existing bookings.
   */
  async checkConflicts(
    proposed: ProposedBooking,
    ignoreBookingId?: string,
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // 1. Direct conflicts — same resource, overlapping time
    const directOverlaps = await bookingRepository.findOverlapping(
      proposed.resourceId,
      proposed.startTime,
      proposed.endTime,
      ignoreBookingId,
    );

    for (const existing of directOverlaps) {
      conflicts.push({ existingBooking: existing, type: 'DIRECT' });
    }

    // 2. Cross-sport conflicts — shared group resources
    const resource = await resourceRepository.findById(proposed.resourceId);
    if (resource?.sharedGroup && COURT_SPORTS.includes(proposed.sport)) {
      const sharedOverlaps = await bookingRepository.findOverlappingBySharedGroup(
        resource.sharedGroup,
        proposed.startTime,
        proposed.endTime,
        ignoreBookingId,
      );

      for (const existing of sharedOverlaps) {
        // Don't double-count direct conflicts
        if (existing.resourceId === proposed.resourceId) continue;
        // Only count if the existing booking is also a court sport
        if (COURT_SPORTS.includes(existing.sport)) {
          conflicts.push({ existingBooking: existing, type: 'CROSS_SPORT' });
        }
      }
    }

    return conflicts;
  }
}

export const conflictService = new ConflictService();
