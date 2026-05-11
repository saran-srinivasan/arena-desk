import { query, execute, getPool } from '../database/connection.ts';
import type { Booking, BookingRow, BookingStatus } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Helpers ──────────────────────────────────────────────────
function toISO(val: Date | string): string {
  if (typeof val === 'string') {
    // MySQL DATETIME string (YYYY-MM-DD HH:mm:ss) is parsed as local time by new Date()
    return new Date(val).toISOString();
  }
  return val.toISOString();
}

function toMySQLDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Format as YYYY-MM-DD HH:mm:ss using local time components
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ── Row → Model Mapper ───────────────────────────────────────
function toBooking(row: BookingRow & RowDataPacket): Booking {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    sport: row.sport,
    resourceId: row.resource_id,
    resourceName: row.resource_name,
    startTime: toISO(row.start_time),
    endTime: toISO(row.end_time),
    status: row.status,
    notes: row.notes ?? undefined,
    createdBy: row.created_by,
    createdAt: toISO(row.created_at),
    price: row.price,
  };
}

// ── Repository ────────────────────────────────────────────────
export class BookingRepository {
  async findAll(): Promise<Booking[]> {
    const rows = await query<(BookingRow & RowDataPacket)[]>(
      'SELECT * FROM bookings ORDER BY start_time DESC',
    );
    return rows.map(toBooking);
  }

  async findById(id: string): Promise<Booking | null> {
    const rows = await query<(BookingRow & RowDataPacket)[]>(
      'SELECT * FROM bookings WHERE id = ?',
      [id],
    );
    return rows.length > 0 ? toBooking(rows[0]) : null;
  }

  async findByStatus(status: BookingStatus): Promise<Booking[]> {
    const rows = await query<(BookingRow & RowDataPacket)[]>(
      'SELECT * FROM bookings WHERE status = ? ORDER BY start_time DESC',
      [status],
    );
    return rows.map(toBooking);
  }

  async findByDate(date: string): Promise<Booking[]> {
    // date is YYYY-MM-DD
    const rows = await query<(BookingRow & RowDataPacket)[]>(
      `SELECT * FROM bookings
       WHERE DATE(start_time) = ? AND status != 'Cancelled'
       ORDER BY start_time ASC`,
      [date],
    );
    return rows.map(toBooking);
  }

  async findByResource(resourceId: string, date: string): Promise<Booking[]> {
    const rows = await query<(BookingRow & RowDataPacket)[]>(
      `SELECT * FROM bookings
       WHERE resource_id = ? AND DATE(start_time) = ? AND status != 'Cancelled'
       ORDER BY start_time ASC`,
      [resourceId, date],
    );
    return rows.map(toBooking);
  }

  async findByCustomer(customerId: string): Promise<Booking[]> {
    const rows = await query<(BookingRow & RowDataPacket)[]>(
      'SELECT * FROM bookings WHERE customer_id = ? ORDER BY start_time DESC',
      [customerId],
    );
    return rows.map(toBooking);
  }

  /**
   * Find bookings that overlap with a given time range on a given resource.
   * Excludes Cancelled and Completed bookings. Optionally ignores a specific booking.
   */
  async findOverlapping(
    resourceId: string,
    startTime: string,
    endTime: string,
    ignoreBookingId?: string,
  ): Promise<Booking[]> {
    let sql = `SELECT * FROM bookings
       WHERE resource_id = ?
         AND status NOT IN ('Cancelled', 'Completed')
         AND start_time < ?
         AND end_time > ?`;
    const params: unknown[] = [resourceId, toMySQLDateTime(endTime), toMySQLDateTime(startTime)];

    if (ignoreBookingId) {
      sql += ' AND id != ?';
      params.push(ignoreBookingId);
    }

    const rows = await query<(BookingRow & RowDataPacket)[]>(sql, params);
    return rows.map(toBooking);
  }

  /**
   * Find all non-cancelled/completed bookings overlapping a time range
   * for any resource in a given shared group.
   */
  async findOverlappingBySharedGroup(
    sharedGroup: string,
    startTime: string,
    endTime: string,
    ignoreBookingId?: string,
  ): Promise<Booking[]> {
    let sql = `SELECT b.* FROM bookings b
       JOIN resources r ON b.resource_id = r.id
       WHERE r.shared_group = ?
         AND b.status NOT IN ('Cancelled', 'Completed')
         AND b.start_time < ?
         AND b.end_time > ?`;
    const params: unknown[] = [sharedGroup, toMySQLDateTime(endTime), toMySQLDateTime(startTime)];

    if (ignoreBookingId) {
      sql += ' AND b.id != ?';
      params.push(ignoreBookingId);
    }

    const rows = await query<(BookingRow & RowDataPacket)[]>(sql, params);
    return rows.map(toBooking);
  }

  async create(booking: Booking): Promise<Booking> {
    const startDT = toMySQLDateTime(booking.startTime);
    const endDT = toMySQLDateTime(booking.endTime);

    await execute(
      `INSERT INTO bookings (id, customer_id, customer_name, sport, resource_id, resource_name, start_time, end_time, status, notes, created_by, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.id, booking.customerId, booking.customerName, booking.sport,
        booking.resourceId, booking.resourceName, startDT, endDT,
        booking.status, booking.notes ?? null, booking.createdBy, booking.price ?? 0,
      ],
    );
    return (await this.findById(booking.id))!;
  }

  async update(id: string, patch: Partial<Booking>): Promise<Booking | null> {
    const sets: string[] = [];
    const params: unknown[] = [];

    const fieldMap: Record<string, string> = {
      customerId: 'customer_id',
      customerName: 'customer_name',
      sport: 'sport',
      resourceId: 'resource_id',
      resourceName: 'resource_name',
      startTime: 'start_time',
      endTime: 'end_time',
      status: 'status',
      notes: 'notes',
      price: 'price',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in patch && patch[key as keyof Booking] !== undefined) {
        let val = patch[key as keyof Booking];
        // Convert ISO dates to MySQL DATETIME (local)
        if ((key === 'startTime' || key === 'endTime') && typeof val === 'string') {
          val = toMySQLDateTime(val);
        }
        sets.push(`${col} = ?`);
        params.push(val);
      }
    }

    if (sets.length === 0) return this.findById(id);

    params.push(id);
    await execute(`UPDATE bookings SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  }

  /**
   * Atomically get the next booking ID for a given prefix (e.g., 'BK', 'AD').
   */
  async getNextId(prefix: string): Promise<string> {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute(
        'UPDATE booking_sequence SET last_number = last_number + 1 WHERE prefix = ?',
        [prefix],
      );
      const [rows] = await conn.execute<any>(
        'SELECT last_number FROM booking_sequence WHERE prefix = ?',
        [prefix],
      );
      await conn.commit();
      return `${prefix}-${rows[0].last_number}`;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

export const bookingRepository = new BookingRepository();
