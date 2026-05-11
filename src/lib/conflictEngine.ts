import { Booking, ProposedBooking, Conflict, SportType, Resource, CoachingBatch } from '../types';

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
 * Generates virtual Booking objects for a given array of CoachingBatches within a specific date range.
 */
export function generateVirtualBookingsForBatches(
  batches: CoachingBatch[],
  rangeStart: Date,
  rangeEnd: Date
): Booking[] {
  const virtual: Booking[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (const batch of batches) {
    if (batch.status === 'Cancelled' || batch.status === 'Completed') continue;
    
    const bStart = new Date(batch.startDate);
    bStart.setHours(0, 0, 0, 0);
    const bEnd = new Date(batch.endDate);
    bEnd.setHours(23, 59, 59, 999);

    let curr = new Date(rangeStart);
    curr.setHours(0, 0, 0, 0);

    while (curr <= rangeEnd) {
      if (curr >= bStart && curr <= bEnd) {
        if (batch.scheduleDays.includes(days[curr.getDay()])) {
          const [sh, sm] = batch.startTime.split(':').map(Number);
          const [eh, em] = batch.endTime.split(':').map(Number);
          
          const startT = new Date(curr);
          startT.setHours(sh, sm, 0, 0);
          
          const endT = new Date(curr);
          endT.setHours(eh, em, 0, 0);
          
          virtual.push({
            id: `batch-${batch.id}-${curr.getTime()}`,
            customerId: 'batch',
            customerName: `Batch: ${batch.name}`,
            sport: batch.sport,
            resourceId: batch.resourceId,
            resourceName: batch.resourceName || 'Resource',
            startTime: startT.toISOString(),
            endTime: endT.toISOString(),
            status: 'Confirmed',
            createdBy: 'system',
            createdAt: batch.createdAt
          });
        }
      }
      curr = new Date(curr.getTime() + 24 * 60 * 600);
    }
  }
  return virtual;
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
  resources: Resource[],
  batches: CoachingBatch[] = []
): Conflict[] {
  const conflicts: Conflict[] = [];

  // Add virtual bookings for batches on the proposed date
  const proposedDate = new Date(proposed.startTime);
  const virtualBookings = generateVirtualBookingsForBatches(batches, proposedDate, proposedDate);
  const allBookings = [...existingBookings, ...virtualBookings];

  // Find the resource being booked
  const proposedResource = resources.find(r => r.id === proposed.resourceId);

  let poolOverlappingBookings: Booking[] = [];
  let poolBatchConflict = false;

  for (const existing of allBookings) {
    // Skip cancelled / completed bookings
    if (existing.status === 'Cancelled' || existing.status === 'Completed') continue;

    // Check time overlap first — if no overlap, no conflict possible
    if (!timeRangesOverlap(proposed.startTime, proposed.endTime, existing.startTime, existing.endTime)) {
      continue;
    }

    // Case 1: Direct conflict — same resource
    if (existing.resourceId === proposed.resourceId) {
      if (proposedResource?.type === 'Pool') {
        if (existing.customerId === 'batch') {
          poolBatchConflict = true;
          conflicts.push({ existingBooking: existing, type: 'DIRECT' });
        } else {
          poolOverlappingBookings.push(existing);
        }
      } else {
        conflicts.push({ existingBooking: existing, type: 'DIRECT' });
      }
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

  if (proposedResource?.type === 'Pool' && !poolBatchConflict) {
    const maxCap = proposedResource.maxCapacity || 1;
    if (poolOverlappingBookings.length >= maxCap) {
      conflicts.push({ existingBooking: poolOverlappingBookings[0], type: 'DIRECT' });
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
  resources: Resource[],
  batches: CoachingBatch[] = []
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
  
  // Add virtual batch bookings for this specific date
  const virtualBookings = generateVirtualBookingsForBatches(batches, date, date);
  const allActiveBookings = [...activeBookings, ...virtualBookings];

  // Check direct bookings on this resource
  let poolOverlappingBookings: Booking[] = [];
  for (const b of allActiveBookings) {
    if (b.resourceId === resourceId && timeRangesOverlap(slotStartISO, slotEndISO, b.startTime, b.endTime)) {
      if (resource.type === 'Pool') {
        if (b.customerId === 'batch') {
          return { state: 'booked', booking: b };
        } else {
          poolOverlappingBookings.push(b);
        }
      } else {
        return { state: 'booked', booking: b };
      }
    }
  }

  if (resource.type === 'Pool') {
    const maxCap = resource.maxCapacity || 1;
    if (poolOverlappingBookings.length >= maxCap) {
      return { state: 'booked', booking: poolOverlappingBookings[0] };
    }
  }

  // Check cross-sport blocking (shared group)
  if (resource.sharedGroup && resource.supportedSports.some(s => COURT_SPORTS.includes(s))) {
    for (const b of allActiveBookings) {
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
