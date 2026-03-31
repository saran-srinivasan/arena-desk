import { Booking, ProposedBooking, Conflict, SportType, Resource } from '../types';

// ── Shared resource configuration ─────────────────────────────
// Sports that share a single physical court space
export const COURT_SPORTS: SportType[] = ['Cricket', 'Pickleball', 'Volleyball'];

/**
 * Check if two time ranges overlap.
 * Uses open-ended comparison: (startA < endB) && (endA > startB)
 */
export function timeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const a0 = new Date(startA).getTime();
  const a1 = new Date(endA).getTime();
  const b0 = new Date(startB).getTime();
  const b1 = new Date(endB).getTime();
  return a0 < b1 && a1 > b0;
}

/**
 * Determines if two bookings conflict based on the shared resource rules.
 *
 * DIRECT conflict  → same resource, overlapping time
 * CROSS_SPORT      → both are court sports on the same shared-group resource, overlapping time
 */
export function getConflicts(
  proposed: ProposedBooking,
  existingBookings: Booking[],
  resources: Resource[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  // Find the resource being booked
  const proposedResource = resources.find(r => r.id === proposed.resourceId);

  for (const existing of existingBookings) {
    // Skip cancelled / completed bookings
    if (existing.status === 'Cancelled' || existing.status === 'Completed') continue;

    // Check time overlap first — if no overlap, no conflict possible
    if (!timeRangesOverlap(proposed.startTime, proposed.endTime, existing.startTime, existing.endTime)) {
      continue;
    }

    // Case 1: Direct conflict — same resource
    if (existing.resourceId === proposed.resourceId) {
      conflicts.push({ existingBooking: existing, type: 'DIRECT' });
      continue;
    }

    // Case 2: Cross-sport conflict — different resource IDs but same shared group
    if (proposedResource?.sharedGroup) {
      const existingResource = resources.find(r => r.id === existing.resourceId);
      if (
        existingResource?.sharedGroup === proposedResource.sharedGroup &&
        COURT_SPORTS.includes(proposed.sport) &&
        COURT_SPORTS.includes(existing.sport)
      ) {
        conflicts.push({ existingBooking: existing, type: 'CROSS_SPORT' });
      }
    }
  }

  return conflicts;
}

/**
 * Returns the state of a specific time slot on the calendar.
 *
 * 'booked'    → a booking exists for THIS resource at this hour
 * 'blocked'   → a court-sport booking on a shared-group resource blocks this slot
 * 'available' → slot is free
 */
export type SlotState = 'available' | 'booked' | 'blocked';

export function getSlotState(
  resourceId: string,
  hour: number,
  date: Date,
  bookings: Booking[],
  resources: Resource[]
): { state: SlotState; booking?: Booking } {
  const resource = resources.find(r => r.id === resourceId);
  if (!resource) return { state: 'available' };

  // Build the time range for this hour slot
  const slotStart = new Date(date);
  slotStart.setHours(hour, 0, 0, 0);
  const slotEnd = new Date(date);
  slotEnd.setHours(hour + 1, 0, 0, 0);

  const slotStartISO = slotStart.toISOString();
  const slotEndISO = slotEnd.toISOString();

  // Active bookings only
  const activeBookings = bookings.filter(
    b => b.status !== 'Cancelled' && b.status !== 'Completed'
  );

  // Check direct bookings on this resource
  for (const b of activeBookings) {
    if (b.resourceId === resourceId && timeRangesOverlap(slotStartISO, slotEndISO, b.startTime, b.endTime)) {
      return { state: 'booked', booking: b };
    }
  }

  // Check cross-sport blocking (shared group)
  if (resource.sharedGroup && resource.supportedSports.some(s => COURT_SPORTS.includes(s))) {
    for (const b of activeBookings) {
      if (b.resourceId === resourceId) continue; // already checked above
      const bResource = resources.find(r => r.id === b.resourceId);
      if (
        bResource?.sharedGroup === resource.sharedGroup &&
        COURT_SPORTS.includes(b.sport) &&
        timeRangesOverlap(slotStartISO, slotEndISO, b.startTime, b.endTime)
      ) {
        return { state: 'blocked', booking: b };
      }
    }
  }

  return { state: 'available' };
}
