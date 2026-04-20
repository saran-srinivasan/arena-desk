import { getPool } from './connection.ts';

/**
 * Seed the database with initial demo data.
 * This is idempotent — it checks for existing data before inserting.
 */
export async function seedDatabase(): Promise<void> {
  const pool = getPool();

  // Check if data already exists
  const [rows] = await pool.execute<any>('SELECT COUNT(*) as count FROM resources');
  if (rows[0].count > 0) {
    console.log('  ✓ Database already seeded — skipping');
    return;
  }

  console.log('  ⟳ Seeding database...');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ── Resources ───────────────────────────────────────────
    await conn.execute(
      `INSERT INTO resources (id, name, type, sub_type, shared_group, supported_sports) VALUES
        ('turf-a', 'Turf A', 'Turf', 'Full Pitch', NULL, '["Cricket"]'),
        ('turf-b', 'Turf B', 'Turf', 'Half Pitch', NULL, '["Cricket"]'),
        ('court-1', 'Court 1', 'Court', 'Multi-Sport', 'multi-sport-court', '["Cricket","Pickleball","Volleyball","Basketball"]'),
        ('court-2', 'Court 2', 'Court', 'Multi-Sport', NULL, '["Basketball","Volleyball"]'),
        ('pool-1', 'Pool', 'Pool', 'Lane 1-4', NULL, '["Swimming"]')`,
    );

    // ── Customers ───────────────────────────────────────────
    await conn.execute(
      `INSERT INTO customers (id, name, phone, email, preferred_sport, total_bookings, created_at) VALUES
        ('c1', 'Marcus Thompson', '+1 (555) 012-3456', 'marcus@example.com', 'Cricket', 24, '2025-08-12 10:00:00'),
        ('c2', 'Sarah Jenkins', '+1 (555) 234-5678', 'sarah@example.com', 'Swimming', 18, '2025-09-05 14:00:00'),
        ('c3', 'David Miller', '+1 (555) 345-6789', 'david@example.com', 'Volleyball', 31, '2025-07-20 09:30:00'),
        ('c4', 'Alex Lindon', '+1 (555) 456-7890', 'alex.l@example.com', 'Basketball', 12, '2025-11-01 16:00:00'),
        ('c5', 'Maria Santos', '+1 (555) 567-8901', 'maria.s@example.com', 'Pickleball', 9, '2026-01-10 11:00:00'),
        ('c6', 'Priya Patel', '+1 (555) 678-9012', 'priya.p@example.com', 'Cricket', 6, '2026-02-14 08:00:00'),
        ('c7', 'James Wilson', '+1 (555) 789-0123', 'james.w@example.com', 'Swimming', 15, '2025-12-22 13:00:00')`,
    );

    // ── Bookings ────────────────────────────────────────────
    // Use today's date for dynamic bookings
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

    // Helper: format date for MySQL DATETIME
    const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

    // Active sessions (already checked in)
    const active1Start = new Date(now.getTime() - 45 * 60 * 1000);
    const active1End = new Date(now.getTime() + 15 * 60 * 1000);
    const active2Start = new Date(now.getTime() - 20 * 60 * 1000);
    const active2End = new Date(now.getTime() + 40 * 60 * 1000);
    const active3Start = new Date(now.getTime() - 72 * 60 * 1000);
    const active3End = new Date(now.getTime() - 12 * 60 * 1000);

    // Upcoming confirmed bookings (fixed hours today)
    const mkTime = (hours: number, mins: number = 0) => {
      const d = new Date(todayStr + 'T00:00:00');
      d.setHours(hours, mins, 0, 0);
      return d;
    };

    const bookingValues = [
      // Active bookings
      ['AD-10245', 'c1', 'Marcus Thompson', 'Cricket', 'turf-a', 'Turf A', fmt(active1Start), fmt(active1End), 'Active', null, 'Alex Rivera', 5000],
      ['AD-10258', 'c2', 'Sarah Jenkins', 'Swimming', 'pool-1', 'Pool', fmt(active2Start), fmt(active2End), 'Active', null, 'Alex Rivera', 3500],
      ['AD-10192', 'c3', 'David Miller', 'Volleyball', 'court-1', 'Court 1', fmt(active3Start), fmt(active3End), 'Active', null, 'Alex Rivera', 4500],
      // Confirmed bookings
      ['BK-8821', 'c4', 'Alex Lindon', 'Basketball', 'court-2', 'Court 2', fmt(mkTime(14)), fmt(mkTime(15)), 'Confirmed', null, 'Alex Rivera', 4000],
      ['BK-8822', 'c5', 'Maria Santos', 'Pickleball', 'court-1', 'Court 1', fmt(mkTime(10)), fmt(mkTime(11, 30)), 'Confirmed', null, 'Alex Rivera', 3000],
      ['BK-8823', 'c6', 'Priya Patel', 'Cricket', 'turf-b', 'Turf B', fmt(mkTime(16)), fmt(mkTime(18)), 'Confirmed', null, 'Alex Rivera', 8000],
      ['BK-8824', 'c7', 'James Wilson', 'Swimming', 'pool-1', 'Pool', fmt(mkTime(17)), fmt(mkTime(18)), 'Confirmed', null, 'Alex Rivera', 3500],
      ['BK-8825', 'c1', 'Marcus Thompson', 'Cricket', 'turf-a', 'Turf A', fmt(mkTime(19)), fmt(mkTime(21)), 'Confirmed', null, 'Alex Rivera', 7000],
    ];

    for (const vals of bookingValues) {
      await conn.execute(
        `INSERT INTO bookings (id, customer_id, customer_name, sport, resource_id, resource_name, start_time, end_time, status, notes, created_by, price_cents)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        vals,
      );
    }

    // ── Active Sessions ─────────────────────────────────────
    const sessionValues = [
      ['AD-10245', 'c1', 'Marcus Thompson', 'Cricket', 'turf-a', 'Turf A', fmt(active1Start), fmt(active1End)],
      ['AD-10258', 'c2', 'Sarah Jenkins', 'Swimming', 'pool-1', 'Pool', fmt(active2Start), fmt(active2End)],
      ['AD-10192', 'c3', 'David Miller', 'Volleyball', 'court-1', 'Court 1', fmt(active3Start), fmt(active3End)],
    ];

    for (const vals of sessionValues) {
      await conn.execute(
        `INSERT INTO active_sessions (booking_id, customer_id, customer_name, sport, resource_id, resource_name, start_time, end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        vals,
      );
    }

    await conn.commit();
    console.log('  ✓ Database seeded successfully');
    console.log('    → 5 resources, 7 customers, 8 bookings, 3 active sessions');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
