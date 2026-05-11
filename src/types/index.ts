// ── Sport & Status Enums ──────────────────────────────────────
export type SportType = 'Cricket' | 'Pickleball' | 'Volleyball' | 'Swimming' | 'Basketball';
export type BookingStatus = 'Confirmed' | 'CheckedIn' | 'Active' | 'Completed' | 'Cancelled';
export type UserRole = 'Super Admin' | 'Admin';
export type SessionSeverity = 'green' | 'amber' | 'red' | 'overstay';
export type CustomerType = 'Member' | 'Student' | 'Walk-in';
export type MembershipStatus = 'Active' | 'Expired' | 'Cancelled' | 'Frozen';
export type PaymentStatusType = 'Paid' | 'Pending' | 'Overdue';
export type CoachStatus = 'Active' | 'Inactive';
export type BatchStatus = 'Active' | 'Upcoming' | 'Completed' | 'Cancelled';
export type BatchLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All';
export type EnrollmentStatus = 'Active' | 'Dropped' | 'Completed';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type PaymentType = 'Membership' | 'Enrollment' | 'Booking';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Other';
export type PaymentTransactionStatus = 'Completed' | 'Pending' | 'Refunded' | 'Failed';

// ── Customer ──────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
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
  maxCapacity?: number;
}

// ── Membership Plan ───────────────────────────────────────────
export interface MembershipPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  sportsAccess: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// ── Membership ────────────────────────────────────────────────
export interface Membership {
  id: string;
  customerId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  paymentStatus: PaymentStatusType;
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  planName?: string;
}

// ── Coach ─────────────────────────────────────────────────────
export interface Coach {
  id: string;
  name: string;
  phone: string;
  email: string;
  sportSpecializations: SportType[];
  photoUrl?: string;
  status: CoachStatus;
  createdAt: string;
}

// ── Coaching Batch ────────────────────────────────────────────
export interface CoachingBatch {
  id: string;
  name: string;
  sport: SportType;
  coachId: string;
  resourceId: string;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  level: BatchLevel;
  fee: number;
  status: BatchStatus;
  notes?: string;
  createdAt: string;
  coachName?: string;
  resourceName?: string;
  enrolledCount?: number;
}

// ── Student Enrollment ────────────────────────────────────────
export interface StudentEnrollment {
  id: string;
  studentId: string;
  batchId: string;
  enrollmentDate: string;
  paymentStatus: PaymentStatusType;
  status: EnrollmentStatus;
  createdAt: string;
  studentName?: string;
  studentPhone?: string;
  studentEmail?: string;
  batchName?: string;
}

// ── Attendance ────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  batchId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt: string;
  studentName?: string;
  studentId?: string;
}

// ── Payment ───────────────────────────────────────────────────
export interface Payment {
  id: string;
  customerId: string;
  type: PaymentType;
  referenceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  customerName?: string;
}

// ── Coach Performance ─────────────────────────────────────────
export interface CoachPerformance {
  coach: Coach;
  totalBatches: number;
  activeBatches: number;
  totalStudents: number;
  averageAttendancePercent: number;
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
  price?: number;
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

// ── Pricing Rule ──────────────────────────────────────────────
export interface PricingRule {
  id: string;
  sport: SportType;
  hourlyRate: number;
  createdAt: string;
  updatedAt: string;
}

// ── Staff ─────────────────────────────────────────────────────
export interface Staff {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

// ── Auth ──────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

// ── Resource DTOs ─────────────────────────────────────────────
export interface CreateResourceDto {
  name: string;
  type: 'Court' | 'Turf' | 'Pool';
  subType?: string;
  sharedGroup?: string;
  supportedSports: SportType[];
  maxCapacity?: number;
}

export interface UpdateResourceDto {
  name?: string;
  type?: 'Court' | 'Turf' | 'Pool';
  subType?: string;
  sharedGroup?: string;
  supportedSports?: SportType[];
  maxCapacity?: number;
}
