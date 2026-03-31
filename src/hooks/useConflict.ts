import { useMemo } from 'react';
import { useBookings } from '../contexts/BookingContext';
import { ProposedBooking, Conflict } from '../types';

/**
 * Hook that returns a conflict-checking function bound to the current booking state.
 * Usage:
 *   const { checkConflicts } = useConflict();
 *   const conflicts = checkConflicts({ resourceId, sport, startTime, endTime });
 */
export function useConflict() {
  const { checkConflicts } = useBookings();

  return useMemo(
    () => ({
      checkConflicts: (proposed: ProposedBooking): Conflict[] => checkConflicts(proposed),
    }),
    [checkConflicts]
  );
}
