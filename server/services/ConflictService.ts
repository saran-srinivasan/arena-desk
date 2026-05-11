import { bookingRepository } from '../repositories/BookingRepository.ts';
import { resourceRepository } from '../repositories/ResourceRepository.ts';
import { batchRepository } from '../repositories/BatchRepository.ts';
import type { Booking, Conflict, ProposedBooking, SportType, CoachingBatch } from '../types/index.ts';

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
    const resource = await resourceRepository.findById(proposed.resourceId);
    if (!resource) return [];

    // 1. Check for Coaching Batches first (they block the resource entirely)
    const startD = new Date(proposed.startTime);
    const endD = new Date(proposed.endTime);
    const dateStr = proposed.startTime.split('T')[0];
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStartStr = `${pad(startD.getHours())}:${pad(startD.getMinutes())}:${pad(startD.getSeconds())}`;
    const timeEndStr = `${pad(endD.getHours())}:${pad(endD.getMinutes())}:${pad(endD.getSeconds())}`;

    const overlappingBatches = await batchRepository.findOverlapping(
      proposed.resourceId,
      dateStr,
      timeStartStr,
      timeEndStr
    );

    if (overlappingBatches.length > 0) {
      // Create a virtual booking for the batch conflict
      const batch = overlappingBatches[0];
      const virtual: Booking = {
        id: `batch-${batch.id}`,
        customerId: 'batch',
        customerName: `Batch: ${batch.name}`,
        sport: batch.sport,
        resourceId: batch.resourceId,
        resourceName: batch.resourceName || 'Resource',
        startTime: proposed.startTime, // Close enough for conflict indicator
        endTime: proposed.endTime,
        status: 'Confirmed',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      };
      conflicts.push({ existingBooking: virtual, type: 'DIRECT' });
      // If a batch exists, it's a total block, so we can return early
      return conflicts;
    }

    // 2. Direct conflicts — same resource, overlapping time
    const directOverlaps = await bookingRepository.findOverlapping(
      proposed.resourceId,
      proposed.startTime,
      proposed.endTime,
      ignoreBookingId,
    );

    if (resource.type === 'Pool') {
      const maxCap = resource.maxCapacity || 1;
      if (directOverlaps.length >= maxCap) {
        conflicts.push({ existingBooking: directOverlaps[0], type: 'DIRECT' });
      }
    } else {
      for (const existing of directOverlaps) {
        conflicts.push({ existingBooking: existing, type: 'DIRECT' });
      }
    }

    // 3. Cross-sport conflicts — shared group resources
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
