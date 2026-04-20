// ── Sport & Status Enums ──────────────────────────────────────
export type SportType = 'Cricket' | 'Pickleball' | 'Volleyball' | 'Swimming' | 'Basketball';
export type BookingStatus = 'Confirmed' | 'CheckedIn' | 'Active' | 'Completed' | 'Cancelled';
export type UserRole = 'Super Admin' | 'Admin';
export type SessionSeverity = 'green' | 'amber' | 'red' | 'overstay';

// ── Resource ──────────────────────────────────────────────────
export interface Resource {
  id: string;
  name: string;
  type: 'Court' | 'Turf' | 'Pool';
  subType?: string;
  sharedGroup?: string;
  supportedSports: SportType[];
}

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

// ── DTOs ──────────────────────────────────────────────────────
export interface CreateBookingDto {
  customerId: string;
  sport: SportType;
  resourceId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdBy: string;
  priceCents?: number;
}

export interface UpdateBookingDto {
  customerId?: string;
  sport?: SportType;
  resourceId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  priceCents?: number;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email: string;
  preferredSport: SportType;
  photoUrl?: string;
}

// ── API Response ──────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── App Error ─────────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, `${resource} with id '${id}' not found`, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, public conflicts?: Conflict[]) {
    super(409, message, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

// ── Database Row Types (snake_case) ───────────────────────────
export interface ResourceRow {
  id: string;
  name: string;
  type: 'Court' | 'Turf' | 'Pool';
  sub_type: string | null;
  shared_group: string | null;
  supported_sports: string; // JSON string
  created_at: Date;
}

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferred_sport: SportType;
  photo_url: string | null;
  total_bookings: number;
  created_at: Date;
}

export interface BookingRow {
  id: string;
  customer_id: string;
  customer_name: string;
  sport: SportType;
  resource_id: string;
  resource_name: string;
  start_time: Date;
  end_time: Date;
  status: BookingStatus;
  notes: string | null;
  created_by: string;
  price_cents: number;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRow {
  booking_id: string;
  customer_id: string;
  customer_name: string;
  sport: SportType;
  resource_id: string;
  resource_name: string;
  start_time: Date;
  end_time: Date;
  created_at: Date;
}
