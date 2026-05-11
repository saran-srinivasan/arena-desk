import { execute, query } from './connection.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Random helpers ─────────────────────────────────────────────
function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ── Seed Runner ───────────────────────────────────────────────
export async function seedDatabase(): Promise<void> {
  // Skip if data already exists
  const rows = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM resources');
  if ((rows[0] as any).count > 0) {
    console.log('⏭️  Seed skipped – data already exists');
    return;
  }

  console.log('🌱 Seeding database...');

  // ── Resources ──────────────────────────────────────────
  const resources = [
    { id: 'r-cricket-1', name: 'Cricket Net 1', type: 'Court', sub_type: 'Practice Net', shared_group: null, sports: ['Cricket'] },
    { id: 'r-cricket-2', name: 'Cricket Net 2', type: 'Court', sub_type: 'Practice Net', shared_group: null, sports: ['Cricket'] },
    { id: 'r-pickleball-1', name: 'Pickleball Court A', type: 'Court', sub_type: null, shared_group: 'multi-court-1', sports: ['Pickleball'] },
    { id: 'r-multi-1', name: 'Multi-Sport Court 1', type: 'Court', sub_type: null, shared_group: 'multi-court-1', sports: ['Pickleball', 'Volleyball', 'Basketball'] },
    { id: 'r-pool-1', name: 'Olympic Pool', type: 'Pool', sub_type: '25m', shared_group: null, sports: ['Swimming'], max_capacity: 15 },
    { id: 'r-pool-2', name: 'Kids Pool', type: 'Pool', sub_type: '10m', shared_group: null, sports: ['Swimming'], max_capacity: 5 },
    { id: 'r-turf-1', name: 'Main Turf', type: 'Turf', sub_type: '5-a-side', shared_group: null, sports: ['Cricket', 'Basketball'] },
  ];
  for (const r of resources) {
    await execute(
      'INSERT INTO resources (id, name, type, sub_type, shared_group, supported_sports, max_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [r.id, r.name, r.type, r.sub_type, r.shared_group, JSON.stringify(r.sports), (r as any).max_capacity ?? 1],
    );
  }

  // ── Customers ──────────────────────────────────────────
  const customers = [
    { id: 'c-1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', type: 'Member', sport: 'Cricket' },
    { id: 'c-2', name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya@email.com', type: 'Student', sport: 'Swimming' },
    { id: 'c-3', name: 'Arjun Nair', phone: '+91 76543 21098', email: 'arjun@email.com', type: 'Walk-in', sport: 'Pickleball' },
    { id: 'c-4', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', type: 'Member', sport: 'Volleyball' },
    { id: 'c-5', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', type: 'Student', sport: 'Swimming' },
    { id: 'c-6', name: 'Ananya Iyer', phone: '+91 43210 98765', email: 'ananya@email.com', type: 'Walk-in', sport: 'Basketball' },
    { id: 'c-7', name: 'Rohan Das', phone: '+91 32109 87654', email: 'rohan@email.com', type: 'Member', sport: 'Cricket' },
    { id: 'c-8', name: 'Meera Joshi', phone: '+91 21098 76543', email: 'meera@email.com', type: 'Student', sport: 'Swimming' },
  ];
  for (const c of customers) {
    await execute(
      'INSERT INTO customers (id, name, phone, email, customer_type, preferred_sport, total_bookings) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [c.id, c.name, c.phone, c.email, c.type, c.sport, Math.floor(Math.random() * 20)],
    );
  }

  // ── Membership Plans ───────────────────────────────────
  const plans = [
    { id: 'mp-1', name: 'Silver Monthly', months: 1, price: 200000, sports: ['Cricket', 'Pickleball'], desc: 'Access to cricket nets and pickleball courts.' },
    { id: 'mp-2', name: 'Gold Quarterly', months: 3, price: 500000, sports: ['Cricket', 'Pickleball', 'Volleyball', 'Basketball'], desc: 'Full access to all courts and priority booking.' },
    { id: 'mp-3', name: 'Platinum Annual', months: 12, price: 1500000, sports: ['All'], desc: 'Unlimited access to all facilities, guest passes, and pool access.' },
    { id: 'mp-4', name: 'Bronze Monthly', months: 1, price: 100000, sports: ['Swimming'], desc: 'Pool-only monthly access.' },
  ];
  for (const p of plans) {
    await execute(
      'INSERT INTO membership_plans (id, name, duration_months, price, sports_access, description) VALUES (?, ?, ?, ?, ?, ?)',
      [p.id, p.name, p.months, p.price, JSON.stringify(p.sports), p.desc],
    );
  }

  // ── Memberships ────────────────────────────────────────
  const memberships = [
    { id: 'mem-1', customer: 'c-1', plan: 'mp-2', start: '2026-03-01', end: '2026-06-01', status: 'Active', pay: 'Paid' },
    { id: 'mem-2', customer: 'c-4', plan: 'mp-3', start: '2026-01-01', end: '2027-01-01', status: 'Active', pay: 'Paid' },
    { id: 'mem-3', customer: 'c-7', plan: 'mp-1', start: '2026-04-01', end: '2026-05-01', status: 'Active', pay: 'Pending' },
  ];
  for (const m of memberships) {
    await execute(
      'INSERT INTO memberships (id, customer_id, plan_id, start_date, end_date, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [m.id, m.customer, m.plan, m.start, m.end, m.status, m.pay],
    );
  }

  // ── Coaches ────────────────────────────────────────────
  const coaches = [
    { id: 'coach-1', name: 'Deepak Kumar', phone: '+91 99001 10020', email: 'deepak.coach@email.com', sports: ['Swimming'], status: 'Active' },
    { id: 'coach-2', name: 'Suresh Menon', phone: '+91 99002 20030', email: 'suresh.coach@email.com', sports: ['Cricket', 'Basketball'], status: 'Active' },
    { id: 'coach-3', name: 'Lakshmi Rao', phone: '+91 99003 30040', email: 'lakshmi.coach@email.com', sports: ['Swimming', 'Volleyball'], status: 'Active' },
  ];
  for (const c of coaches) {
    await execute(
      'INSERT INTO coaches (id, name, phone, email, sport_specializations, status) VALUES (?, ?, ?, ?, ?, ?)',
      [c.id, c.name, c.phone, c.email, JSON.stringify(c.sports), c.status],
    );
  }

  // ── Coaching Batches ───────────────────────────────────
  const batches = [
    { id: 'batch-1', name: 'Swimming Beginners A', sport: 'Swimming', coach: 'coach-1', resource: 'r-pool-1', days: ['Mon', 'Wed', 'Fri'], st: '06:00', et: '07:00', sd: '2026-04-01', ed: '2026-06-30', max: 12, level: 'Beginner', fee: 800000, status: 'Active' },
    { id: 'batch-2', name: 'Swimming Advanced B', sport: 'Swimming', coach: 'coach-3', resource: 'r-pool-1', days: ['Tue', 'Thu', 'Sat'], st: '07:00', et: '08:30', sd: '2026-04-01', ed: '2026-06-30', max: 8, level: 'Advanced', fee: 1200000, status: 'Active' },
    { id: 'batch-3', name: 'Cricket Juniors', sport: 'Cricket', coach: 'coach-2', resource: 'r-turf-1', days: ['Mon', 'Wed', 'Fri'], st: '16:00', et: '18:00', sd: '2026-04-15', ed: '2026-07-15', max: 20, level: 'Beginner', fee: 600000, status: 'Upcoming' },
  ];
  for (const b of batches) {
    await execute(
      'INSERT INTO coaching_batches (id, name, sport, coach_id, resource_id, schedule_days, start_time, end_time, start_date, end_date, max_students, level, fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [b.id, b.name, b.sport, b.coach, b.resource, JSON.stringify(b.days), b.st, b.et, b.sd, b.ed, b.max, b.level, b.fee, b.status],
    );
  }

  // ── Student Enrollments ────────────────────────────────
  const enrollments = [
    { id: 'enr-1', student: 'c-2', batch: 'batch-1', date: '2026-04-01', pay: 'Paid' },
    { id: 'enr-2', student: 'c-5', batch: 'batch-1', date: '2026-04-01', pay: 'Pending' },
    { id: 'enr-3', student: 'c-8', batch: 'batch-2', date: '2026-04-01', pay: 'Paid' },
  ];
  for (const e of enrollments) {
    await execute(
      'INSERT INTO student_enrollments (id, student_id, batch_id, enrollment_date, payment_status) VALUES (?, ?, ?, ?, ?)',
      [e.id, e.student, e.batch, e.date, e.pay],
    );
  }

  // ── Sample Payments ────────────────────────────────────
  const payments = [
    { id: 'pay-1', customer: 'c-1', type: 'Membership', ref: 'mem-1', amount: 500000, method: 'UPI', status: 'Completed', paidAt: '2026-03-01 10:00:00' },
    { id: 'pay-2', customer: 'c-4', type: 'Membership', ref: 'mem-2', amount: 1500000, method: 'Bank Transfer', status: 'Completed', paidAt: '2026-01-01 11:00:00' },
    { id: 'pay-3', customer: 'c-2', type: 'Enrollment', ref: 'enr-1', amount: 800000, method: 'Cash', status: 'Completed', paidAt: '2026-04-01 09:00:00' },
    { id: 'pay-4', customer: 'c-8', type: 'Enrollment', ref: 'enr-3', amount: 1200000, method: 'Card', status: 'Completed', paidAt: '2026-04-01 09:30:00' },
  ];
  for (const p of payments) {
    await execute(
      'INSERT INTO payments (id, customer_id, type, reference_id, amount, method, status, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [p.id, p.customer, p.type, p.ref, p.amount, p.method, p.status, p.paidAt],
    );
  }

  // ── Sample Bookings ────────────────────────────────────
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const bookings = [
    { id: 'BK-8826', cust: 'c-1', name: 'Rahul Sharma', sport: 'Cricket', res: 'r-cricket-1', resName: 'Cricket Net 1',
      start: `${today}T10:00:00`, end: `${today}T11:00:00`, status: 'Confirmed', createdBy: 'Alex Rivera' },
    { id: 'BK-8827', cust: 'c-3', name: 'Arjun Nair', sport: 'Pickleball', res: 'r-pickleball-1', resName: 'Pickleball Court A',
      start: `${today}T14:00:00`, end: `${today}T15:30:00`, status: 'Confirmed', createdBy: 'Alex Rivera' },
    { id: 'BK-8828', cust: 'c-4', name: 'Sneha Reddy', sport: 'Volleyball', res: 'r-multi-1', resName: 'Multi-Sport Court 1',
      start: `${today}T17:00:00`, end: `${today}T18:30:00`, status: 'Confirmed', createdBy: 'Alex Rivera' },
    { id: 'BK-8829', cust: 'c-6', name: 'Ananya Iyer', sport: 'Basketball', res: 'r-multi-1', resName: 'Multi-Sport Court 1',
      start: `${today}T19:00:00`, end: `${today}T20:30:00`, status: 'Confirmed', createdBy: 'Alex Rivera' },
  ];

  for (const b of bookings) {
    await execute(
      `INSERT INTO bookings (id, customer_id, customer_name, sport, resource_id, resource_name, start_time, end_time, status, created_by, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.cust, b.name, b.sport, b.res, b.resName, b.start, b.end, b.status, b.createdBy, 50000],
    );
  }

  console.log('✅ Seed complete – resources, customers, plans, memberships, coaches, batches, enrollments, payments & bookings inserted');
}
