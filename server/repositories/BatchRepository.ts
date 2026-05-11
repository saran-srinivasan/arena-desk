import { query, execute } from '../database/connection.ts';
import type { CoachingBatch, BatchRow, CreateBatchDto, UpdateBatchDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Helpers ──────────────────────────────────────────────────
function toISO(val: Date | string): string {
  if (typeof val === 'string') {
    return new Date(val).toISOString();
  }
  return val.toISOString();
}

function toBatch(row: BatchRow & RowDataPacket): CoachingBatch {
  return {
    id: row.id,
    name: row.name,
    sport: row.sport,
    coachId: row.coach_id,
    resourceId: row.resource_id,
    scheduleDays: typeof row.schedule_days === 'string' ? JSON.parse(row.schedule_days) : row.schedule_days,
    startTime: row.start_time,
    endTime: row.end_time,
    startDate: row.start_date,
    endDate: row.end_date,
    maxStudents: row.max_students,
    level: row.level,
    fee: row.fee,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: toISO(row.created_at),
    coachName: row.coach_name,
    resourceName: row.resource_name,
    enrolledCount: row.enrolled_count ?? 0,
  };
}

const JOIN_SELECT = `
  SELECT b.*, co.name AS coach_name, r.name AS resource_name,
    (SELECT COUNT(*) FROM student_enrollments se WHERE se.batch_id = b.id AND se.status = 'Active') AS enrolled_count
  FROM coaching_batches b
  JOIN coaches co ON b.coach_id = co.id
  JOIN resources r ON b.resource_id = r.id
`;

export class BatchRepository {
  async findAll(): Promise<CoachingBatch[]> {
    const rows = await query<(BatchRow & RowDataPacket)[]>(`${JOIN_SELECT} ORDER BY b.start_date DESC, b.start_time`);
    return rows.map(toBatch);
  }

  async findById(id: string): Promise<CoachingBatch | null> {
    const rows = await query<(BatchRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE b.id = ?`, [id]);
    return rows.length > 0 ? toBatch(rows[0]) : null;
  }

  async findBySport(sport: string): Promise<CoachingBatch[]> {
    const rows = await query<(BatchRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE b.sport = ? ORDER BY b.start_date DESC`, [sport]);
    return rows.map(toBatch);
  }

  async findByCoach(coachId: string): Promise<CoachingBatch[]> {
    const rows = await query<(BatchRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE b.coach_id = ? ORDER BY b.start_date DESC`, [coachId]);
    return rows.map(toBatch);
  }

  async create(id: string, dto: CreateBatchDto): Promise<CoachingBatch> {
    await execute(
      `INSERT INTO coaching_batches (id, name, sport, coach_id, resource_id, schedule_days, start_time, end_time, start_date, end_date, max_students, level, fee, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.name, dto.sport, dto.coachId, dto.resourceId, JSON.stringify(dto.scheduleDays), dto.startTime, dto.endTime, dto.startDate, dto.endDate, dto.maxStudents ?? 15, dto.level ?? 'All', dto.fee, dto.notes ?? null],
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdateBatchDto): Promise<CoachingBatch> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.name !== undefined) { fields.push('name = ?'); params.push(dto.name); }
    if (dto.sport !== undefined) { fields.push('sport = ?'); params.push(dto.sport); }
    if (dto.coachId !== undefined) { fields.push('coach_id = ?'); params.push(dto.coachId); }
    if (dto.resourceId !== undefined) { fields.push('resource_id = ?'); params.push(dto.resourceId); }
    if (dto.scheduleDays !== undefined) { fields.push('schedule_days = ?'); params.push(JSON.stringify(dto.scheduleDays)); }
    if (dto.startTime !== undefined) { fields.push('start_time = ?'); params.push(dto.startTime); }
    if (dto.endTime !== undefined) { fields.push('end_time = ?'); params.push(dto.endTime); }
    if (dto.startDate !== undefined) { fields.push('start_date = ?'); params.push(dto.startDate); }
    if (dto.endDate !== undefined) { fields.push('end_date = ?'); params.push(dto.endDate); }
    if (dto.maxStudents !== undefined) { fields.push('max_students = ?'); params.push(dto.maxStudents); }
    if (dto.level !== undefined) { fields.push('level = ?'); params.push(dto.level); }
    if (dto.fee !== undefined) { fields.push('fee = ?'); params.push(dto.fee); }
    if (dto.status !== undefined) { fields.push('status = ?'); params.push(dto.status); }
    if (dto.notes !== undefined) { fields.push('notes = ?'); params.push(dto.notes); }

    if (fields.length === 0) return (await this.findById(id))!;
    params.push(id);
    await execute(`UPDATE coaching_batches SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async findOverlapping(
    resourceId: string,
    date: string, // YYYY-MM-DD
    startTime: string, // HH:mm:ss
    endTime: string, // HH:mm:ss
  ): Promise<CoachingBatch[]> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[new Date(date).getDay()];

    const rows = await query<(BatchRow & RowDataPacket)[]>(
      `${JOIN_SELECT}
       WHERE b.resource_id = ?
         AND b.status NOT IN ('Cancelled', 'Completed')
         AND b.start_date <= ?
         AND b.end_date >= ?
         AND JSON_CONTAINS(b.schedule_days, JSON_QUOTE(?))
         AND b.start_time < ?
         AND b.end_time > ?`,
      [resourceId, date, date, dayName, endTime, startTime]
    );
    return rows.map(toBatch);
  }

  async delete(id: string): Promise<void> {
    await execute('DELETE FROM coaching_batches WHERE id = ?', [id]);
  }
}

export const batchRepository = new BatchRepository();
