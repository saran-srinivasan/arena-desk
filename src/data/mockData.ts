import { ActiveSession, Booking, Resource, Customer, SessionSeverity } from '../types';
import { addMinutes, subMinutes, startOfDay, addHours } from 'date-fns';
import { deriveSeverity } from '../contexts/SessionContext';

const today = new Date();
const todayStart = startOfDay(today);

// ── Resources ─────────────────────────────────────────────────
export const mockResources: Resource[] = [
  { id: 'turf-a', name: 'Turf A', type: 'Turf', subType: 'Full Pitch', supportedSports: ['Cricket'] },
  { id: 'turf-b', name: 'Turf B', type: 'Turf', subType: 'Half Pitch', supportedSports: ['Cricket'] },
  {
    id: 'court-1',
    name: 'Court 1',
    type: 'Court',
    subType: 'Multi-Sport',
    sharedGroup: 'multi-sport-court',
    supportedSports: ['Cricket', 'Pickleball', 'Volleyball', 'Basketball'],
  },
  {
    id: 'court-2',
    name: 'Court 2',
    type: 'Court',
    subType: 'Multi-Sport',
    supportedSports: ['Basketball', 'Volleyball'],
  },
  { id: 'pool-1', name: 'Pool', type: 'Pool', subType: 'Lane 1-4', supportedSports: ['Swimming'] },
];

// ── Customers ─────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  {
    id: 'c1', name: 'Marcus Thompson', phone: '+1 (555) 012-3456',
    email: 'marcus@example.com', preferredSport: 'Cricket',
    createdAt: '2025-08-12T10:00:00Z', totalBookings: 24,
  },
  {
    id: 'c2', name: 'Sarah Jenkins', phone: '+1 (555) 234-5678',
    email: 'sarah@example.com', preferredSport: 'Swimming',
    createdAt: '2025-09-05T14:00:00Z', totalBookings: 18,
  },
  {
    id: 'c3', name: 'David Miller', phone: '+1 (555) 345-6789',
    email: 'david@example.com', preferredSport: 'Volleyball',
    createdAt: '2025-07-20T09:30:00Z', totalBookings: 31,
  },
  {
    id: 'c4', name: 'Alex Lindon', phone: '+1 (555) 456-7890',
    email: 'alex.l@example.com', preferredSport: 'Basketball',
    createdAt: '2025-11-01T16:00:00Z', totalBookings: 12,
  },
  {
    id: 'c5', name: 'Maria Santos', phone: '+1 (555) 567-8901',
    email: 'maria.s@example.com', preferredSport: 'Pickleball',
    createdAt: '2026-01-10T11:00:00Z', totalBookings: 9,
  },
  {
    id: 'c6', name: 'Priya Patel', phone: '+1 (555) 678-9012',
    email: 'priya.p@example.com', preferredSport: 'Cricket',
    createdAt: '2026-02-14T08:00:00Z', totalBookings: 6,
  },
  {
    id: 'c7', name: 'James Wilson', phone: '+1 (555) 789-0123',
    email: 'james.w@example.com', preferredSport: 'Swimming',
    createdAt: '2025-12-22T13:00:00Z', totalBookings: 15,
  },
];

// ── Bookings ──────────────────────────────────────────────────
export const mockBookings: Booking[] = [
  // Active sessions (already checked in)
  {
    id: 'AD-10245', customerId: 'c1', customerName: 'Marcus Thompson',
    sport: 'Cricket', resourceId: 'turf-a', resourceName: 'Turf A',
    startTime: subMinutes(today, 45).toISOString(),
    endTime: addMinutes(today, 15).toISOString(),
    status: 'Active', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 120).toISOString(),
    priceCents: 5000,
  },
  {
    id: 'AD-10258', customerId: 'c2', customerName: 'Sarah Jenkins',
    sport: 'Swimming', resourceId: 'pool-1', resourceName: 'Pool',
    startTime: subMinutes(today, 20).toISOString(),
    endTime: addMinutes(today, 40).toISOString(),
    status: 'Active', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 60).toISOString(),
    priceCents: 3500,
  },
  {
    id: 'AD-10192', customerId: 'c3', customerName: 'David Miller',
    sport: 'Volleyball', resourceId: 'court-1', resourceName: 'Court 1',
    startTime: subMinutes(today, 72).toISOString(),
    endTime: subMinutes(today, 12).toISOString(),
    status: 'Active', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 150).toISOString(),
    priceCents: 4500,
  },

  // Upcoming confirmed bookings
  {
    id: 'BK-8821', customerId: 'c4', customerName: 'Alex Lindon',
    sport: 'Basketball', resourceId: 'court-2', resourceName: 'Court 2',
    startTime: addHours(todayStart, 14).toISOString(),
    endTime: addHours(todayStart, 15).toISOString(),
    status: 'Confirmed', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 300).toISOString(),
    priceCents: 4000,
  },
  {
    id: 'BK-8822', customerId: 'c5', customerName: 'Maria Santos',
    sport: 'Pickleball', resourceId: 'court-1', resourceName: 'Court 1',
    startTime: addHours(todayStart, 10).toISOString(),
    endTime: addHours(todayStart, 11.5).toISOString(),
    status: 'Confirmed', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 240).toISOString(),
    priceCents: 3000,
  },
  {
    id: 'BK-8823', customerId: 'c6', customerName: 'Priya Patel',
    sport: 'Cricket', resourceId: 'turf-b', resourceName: 'Turf B',
    startTime: addHours(todayStart, 16).toISOString(),
    endTime: addHours(todayStart, 18).toISOString(),
    status: 'Confirmed', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 180).toISOString(),
    priceCents: 8000,
  },
  {
    id: 'BK-8824', customerId: 'c7', customerName: 'James Wilson',
    sport: 'Swimming', resourceId: 'pool-1', resourceName: 'Pool',
    startTime: addHours(todayStart, 17).toISOString(),
    endTime: addHours(todayStart, 18).toISOString(),
    status: 'Confirmed', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 90).toISOString(),
    priceCents: 3500,
  },
  {
    id: 'BK-8825', customerId: 'c1', customerName: 'Marcus Thompson',
    sport: 'Cricket', resourceId: 'turf-a', resourceName: 'Turf A',
    startTime: addHours(todayStart, 19).toISOString(),
    endTime: addHours(todayStart, 21).toISOString(),
    status: 'Confirmed', createdBy: 'Alex Rivera', createdAt: subMinutes(today, 60).toISOString(),
    priceCents: 7000,
  },
];

// ── Active Sessions (derived from active bookings) ────────────
function buildSession(booking: Booking): ActiveSession {
  const remaining = Math.floor(
    (new Date(booking.endTime).getTime() - Date.now()) / 1000
  );
  return {
    bookingId: booking.id,
    customerId: booking.customerId,
    customerName: booking.customerName,
    sport: booking.sport,
    resourceId: booking.resourceId,
    resourceName: booking.resourceName,
    startTime: booking.startTime,
    endTime: booking.endTime,
    remainingSeconds: remaining,
    isOverstay: remaining < 0,
    severity: deriveSeverity(remaining),
  };
}

export const mockSessions: ActiveSession[] = mockBookings
  .filter(b => b.status === 'Active')
  .map(buildSession);
