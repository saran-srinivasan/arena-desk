import { query, execute } from '../database/connection.ts';
import type { Attendance, AttendanceRow, CreateAttendanceDto, BulkAttendanceDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

function toAttendance(row: AttendanceRow & RowDataPacket): Attendance {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    batchId: row.batch_id,
    date: row.date,
    status: row.status,
    markedBy: row.marked_by,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
    studentName: row.student_name,
    studentId: row.student_id,
  };
}

const JOIN_SELECT = `
  SELECT a.*, c.name AS student_name, se.student_id
  FROM attendance a
  JOIN student_enrollments se ON a.enrollment_id = se.id
  JOIN customers c ON se.student_id = c.id
`;

export class AttendanceRepository {
  async findByBatchAndDate(batchId: string, date: string): Promise<Attendance[]> {
    const rows = await query<(AttendanceRow & RowDataPacket)[]>(
      `${JOIN_SELECT} WHERE a.batch_id = ? AND a.date = ? ORDER BY c.name`,
      [batchId, date],
    );
    return rows.map(toAttendance);
  }

  async findByEnrollment(enrollmentId: string): Promise<Attendance[]> {
    const rows = await query<(AttendanceRow & RowDataPacket)[]>(
      `${JOIN_SELECT} WHERE a.enrollment_id = ? ORDER BY a.date DESC`,
      [enrollmentId],
    );
    return rows.map(toAttendance);
  }

  async findByBatch(batchId: string): Promise<Attendance[]> {
    const rows = await query<(AttendanceRow & RowDataPacket)[]>(
      `${JOIN_SELECT} WHERE a.batch_id = ? ORDER BY a.date DESC, c.name`,
      [batchId],
    );
    return rows.map(toAttendance);
  }

  async markAttendance(dto: CreateAttendanceDto): Promise<Attendance> {
    const id = `att-${Date.now()}`;
    await execute(
      `INSERT INTO attendance (id, enrollment_id, batch_id, date, status, marked_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)`,
      [id, dto.enrollmentId, dto.batchId, dto.date, dto.status, dto.markedBy],
    );
    // Return the record (find by enrollment + date since id may differ on update)
    const rows = await query<(AttendanceRow & RowDataPacket)[]>(
      `${JOIN_SELECT} WHERE a.enrollment_id = ? AND a.date = ?`,
      [dto.enrollmentId, dto.date],
    );
    return toAttendance(rows[0]);
  }

  async bulkMark(dto: BulkAttendanceDto): Promise<Attendance[]> {
    const results: Attendance[] = [];
    for (const record of dto.records) {
      const att = await this.markAttendance({
        enrollmentId: record.enrollmentId,
        batchId: dto.batchId,
        date: dto.date,
        status: record.status,
        markedBy: dto.markedBy,
      });
      results.push(att);
    }
    return results;
  }

  async getAttendanceStats(batchId: string): Promise<{ total: number; present: number }> {
    const rows = await query<RowDataPacket[]>(
      `SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('Present','Late') THEN 1 ELSE 0 END) as present
       FROM attendance WHERE batch_id = ?`,
      [batchId],
    );
    return { total: (rows[0] as any).total || 0, present: (rows[0] as any).present || 0 };
  }
}

export const attendanceRepository = new AttendanceRepository();
