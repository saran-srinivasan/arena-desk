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

// ── Resource ──────────────────────────────────────────────────
export interface Resource {
  id: string;
  name: string;
  type: 'Court' | 'Turf' | 'Pool';
  subType?: string;
  sharedGroup?: string;
  supportedSports: SportType[];
  maxCapacity?: number;
}

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
  // Joined fields
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
  // Joined fields
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
  // Joined fields
  studentName?: string;
  studentPhone?: string;
  studentEmail?: string;
  batchName?: string;
}

// ── Attendance ────────────────────────────────────────────────
export interface Attendance {
  id: string;
  enrollmentId: string;
  batchId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt: string;
  // Joined fields
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
  // Joined fields
  customerName?: string;
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

// ── DTOs ──────────────────────────────────────────────────────
export interface CreateBookingDto {
  customerId: string;
  sport: SportType;
  resourceId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdBy: string;
  price?: number;
}

export interface UpdateBookingDto {
  customerId?: string;
  sport?: SportType;
  resourceId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  price?: number;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email: string;
  customerType?: CustomerType;
  preferredSport: SportType;
  photoUrl?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  customerType?: CustomerType;
  preferredSport?: SportType;
  photoUrl?: string;
}

export interface CreateMembershipPlanDto {
  name: string;
  durationMonths: number;
  price: number;
  sportsAccess: string[];
  description?: string;
}

export interface UpdateMembershipPlanDto {
  name?: string;
  durationMonths?: number;
  price?: number;
  sportsAccess?: string[];
  description?: string;
  isActive?: boolean;
}

export interface CreateMembershipDto {
  customerId: string;
  planId: string;
  startDate: string;
  autoRenew?: boolean;
  notes?: string;
}

export interface UpdateMembershipDto {
  status?: MembershipStatus;
  paymentStatus?: PaymentStatusType;
  autoRenew?: boolean;
  notes?: string;
}

export interface CreateCoachDto {
  name: string;
  phone: string;
  email: string;
  sportSpecializations: SportType[];
  photoUrl?: string;
}

export interface UpdateCoachDto {
  name?: string;
  phone?: string;
  email?: string;
  sportSpecializations?: SportType[];
  photoUrl?: string;
  status?: CoachStatus;
}

export interface CreateBatchDto {
  name: string;
  sport: SportType;
  coachId: string;
  resourceId: string;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxStudents?: number;
  level?: BatchLevel;
  fee: number;
  notes?: string;
}

export interface UpdateBatchDto {
  name?: string;
  sport?: SportType;
  coachId?: string;
  resourceId?: string;
  scheduleDays?: string[];
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  level?: BatchLevel;
  fee?: number;
  status?: BatchStatus;
  notes?: string;
}

export interface CreateEnrollmentDto {
  studentId: string;
  batchId: string;
  enrollmentDate?: string;
}

export interface CreateAttendanceDto {
  enrollmentId: string;
  batchId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
}

export interface BulkAttendanceDto {
  batchId: string;
  date: string;
  markedBy: string;
  records: { enrollmentId: string; status: AttendanceStatus }[];
}

export interface CreatePaymentDto {
  customerId: string;
  type: PaymentType;
  referenceId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

export interface CreatePricingRuleDto {
  sport: SportType;
  hourlyRate: number;
}

export interface UpdatePricingRuleDto {
  hourlyRate?: number;
}

export interface CreateStaffDto {
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
}

export interface UpdateStaffDto {
  name?: string;
  role?: UserRole;
  email?: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
}

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

// ── Coach Performance ─────────────────────────────────────────
export interface CoachPerformance {
  coach: Coach;
  totalBatches: number;
  activeBatches: number;
  totalStudents: number;
  averageAttendancePercent: number;
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
  max_capacity: number;
  created_at: Date;
}

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  customer_type: CustomerType;
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
  price: number;
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

export interface MembershipPlanRow {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  sports_access: string; // JSON string
  description: string | null;
  is_active: number; // MySQL boolean
  created_at: Date;
}

export interface MembershipRow {
  id: string;
  customer_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  payment_status: PaymentStatusType;
  auto_renew: number; // MySQL boolean
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  // Optional joined fields
  customer_name?: string;
  plan_name?: string;
}

export interface CoachRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  sport_specializations: string; // JSON string
  photo_url: string | null;
  status: CoachStatus;
  created_at: Date;
}

export interface BatchRow {
  id: string;
  name: string;
  sport: SportType;
  coach_id: string;
  resource_id: string;
  schedule_days: string; // JSON string
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  max_students: number;
  level: BatchLevel;
  fee: number;
  status: BatchStatus;
  notes: string | null;
  created_at: Date;
  // Optional joined fields
  coach_name?: string;
  resource_name?: string;
  enrolled_count?: number;
}

export interface EnrollmentRow {
  id: string;
  student_id: string;
  batch_id: string;
  enrollment_date: string;
  payment_status: PaymentStatusType;
  status: EnrollmentStatus;
  created_at: Date;
  // Optional joined fields
  student_name?: string;
  student_phone?: string;
  student_email?: string;
  batch_name?: string;
}

export interface AttendanceRow {
  id: string;
  enrollment_id: string;
  batch_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by: string;
  created_at: Date;
  // Optional joined fields
  student_name?: string;
  student_id?: string;
}

export interface PaymentRow {
  id: string;
  customer_id: string;
  type: PaymentType;
  reference_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  notes: string | null;
  paid_at: string | null;
  created_at: Date;
  // Optional joined fields
  customer_name?: string;
}

export interface PricingRuleRow {
  id: string;
  sport: SportType;
  hourly_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface StaffRow {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string | null;
  status: 'Active' | 'Inactive';
  created_at: Date;
  updated_at: Date;
}
