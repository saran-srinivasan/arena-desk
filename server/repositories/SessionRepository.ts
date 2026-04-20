import { query, execute } from '../database/connection.ts';
import type { ActiveSession, SessionSeverity, SessionRow } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Helpers ───────────────────────────────────────────────────
function deriveSeverity(remainingSeconds: number): SessionSeverity {
  if (remainingSeconds < 0) return 'overstay';
  if (remainingSeconds < 300) return 'red';       // < 5 min
  if (remainingSeconds < 600) return 'amber';     // < 10 min
  return 'green';
}

function toSession(row: SessionRow & RowDataPacket): ActiveSession {
  const toISO = (val: Date | string) =>
    typeof val === 'string' ? new Date(val).toISOString() : val.toISOString();

  const endTime = toISO(row.end_time);
  const remaining = Math.floor((new Date(endTime).getTime() - Date.now()) / 1000);

  return {
    bookingId: row.booking_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    sport: row.sport,
    resourceId: row.resource_id,
    resourceName: row.resource_name,
    startTime: toISO(row.start_time),
    endTime,
    remainingSeconds: remaining,
    isOverstay: remaining < 0,
    severity: deriveSeverity(remaining),
  };
}

// ── Repository ────────────────────────────────────────────────
export class SessionRepository {
  async findAll(): Promise<ActiveSession[]> {
    const rows = await query<(SessionRow & RowDataPacket)[]>(
      'SELECT * FROM active_sessions ORDER BY end_time ASC',
    );
    return rows.map(toSession);
  }

  async findByBookingId(bookingId: string): Promise<ActiveSession | null> {
    const rows = await query<(SessionRow & RowDataPacket)[]>(
      'SELECT * FROM active_sessions WHERE booking_id = ?',
      [bookingId],
    );
    return rows.length > 0 ? toSession(rows[0]) : null;
  }

  async create(session: {
    bookingId: string;
    customerId: string;
    customerName: string;
    sport: string;
    resourceId: string;
    resourceName: string;
    startTime: string;
    endTime: string;
  }): Promise<ActiveSession> {
    const fmt = (iso: string) => new Date(iso).toISOString().slice(0, 19).replace('T', ' ');

    await execute(
      `INSERT INTO active_sessions (booking_id, customer_id, customer_name, sport, resource_id, resource_name, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.bookingId, session.customerId, session.customerName, session.sport,
        session.resourceId, session.resourceName, fmt(session.startTime), fmt(session.endTime),
      ],
    );
    return (await this.findByBookingId(session.bookingId))!;
  }

  async delete(bookingId: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM active_sessions WHERE booking_id = ?',
      [bookingId],
    );
    return result.affectedRows > 0;
  }

  async updateEndTime(bookingId: string, newEndTime: string): Promise<ActiveSession | null> {
    const fmt = (iso: string) => new Date(iso).toISOString().slice(0, 19).replace('T', ' ');
    await execute(
      'UPDATE active_sessions SET end_time = ? WHERE booking_id = ?',
      [fmt(newEndTime), bookingId],
    );
    return this.findByBookingId(bookingId);
  }
}

export const sessionRepository = new SessionRepository();
