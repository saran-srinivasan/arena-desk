// ── Sport & Status Enums ──────────────────────────────────────
export type SportType = 'Cricket' | 'Pickleball' | 'Volleyball' | 'Swimming' | 'Basketball';
export type BookingStatus = 'Confirmed' | 'CheckedIn' | 'Active' | 'Completed' | 'Cancelled';
export type UserRole = 'Super Admin' | 'Admin';
export type SessionSeverity = 'green' | 'amber' | 'red' | 'overstay';

// ── Customer ──────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredSport: SportType;
  photoUrl?: string;
  createdAt: string;
  totalBookings: number;
}

// ── Resource ──────────────────────────────────────────────────
export interface Resource {
  id: string;
  name: string;
  type: 'Court' | 'Turf' | 'Pool';
  subType?: string;
  sharedGroup?: string;        // e.g. 'multi-sport-court'
  supportedSports: SportType[];
}

// ── Booking ───────────────────────────────────────────────────
export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  sport: SportType;
  resourceId: string;
  resourceName: string;
  startTime: string;   // ISO 8601
  endTime: string;     // ISO 8601
  status: BookingStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  priceCents?: number;
}

// ── Active Session ────────────────────────────────────────────
export interface ActiveSession {
  bookingId: string;
  customerId: string;
  customerName: string;
  sport: SportType;
  resourceId: string;
  resourceName: string;
  startTime: string;
  endTime: string;
  remainingSeconds: number;
  isOverstay: boolean;
  severity: SessionSeverity;
}

// ── Conflict Engine ───────────────────────────────────────────
export interface ProposedBooking {
  resourceId: string;
  sport: SportType;
  startTime: string;
  endTime: string;
}

export interface Conflict {
  existingBooking: Booking;
  type: 'DIRECT' | 'CROSS_SPORT';
}

// ── Auth ──────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}
