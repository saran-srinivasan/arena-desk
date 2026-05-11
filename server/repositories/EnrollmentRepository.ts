import { query, execute } from '../database/connection.ts';
import type { StudentEnrollment, EnrollmentRow, CreateEnrollmentDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

function toEnrollment(row: EnrollmentRow & RowDataPacket): StudentEnrollment {
  return {
    id: row.id,
    studentId: row.student_id,
    batchId: row.batch_id,
    enrollmentDate: row.enrollment_date,
    paymentStatus: row.payment_status,
    status: row.status,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
    studentName: row.student_name,
    studentPhone: row.student_phone,
    studentEmail: row.student_email,
    batchName: row.batch_name,
  };
}

const JOIN_SELECT = `
  SELECT se.*, c.name AS student_name, c.phone AS student_phone, c.email AS student_email, cb.name AS batch_name
  FROM student_enrollments se
  JOIN customers c ON se.student_id = c.id
  JOIN coaching_batches cb ON se.batch_id = cb.id
`;

export class EnrollmentRepository {
  async findByBatch(batchId: string): Promise<StudentEnrollment[]> {
    const rows = await query<(EnrollmentRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE se.batch_id = ? ORDER BY c.name`, [batchId]);
    return rows.map(toEnrollment);
  }

  async findByStudent(studentId: string): Promise<StudentEnrollment[]> {
    const rows = await query<(EnrollmentRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE se.student_id = ? ORDER BY se.enrollment_date DESC`, [studentId]);
    return rows.map(toEnrollment);
  }

  async findById(id: string): Promise<StudentEnrollment | null> {
    const rows = await query<(EnrollmentRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE se.id = ?`, [id]);
    return rows.length > 0 ? toEnrollment(rows[0]) : null;
  }

  async findByStudentAndBatch(studentId: string, batchId: string): Promise<StudentEnrollment | null> {
    const rows = await query<(EnrollmentRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE se.student_id = ? AND se.batch_id = ?`, [studentId, batchId]);
    return rows.length > 0 ? toEnrollment(rows[0]) : null;
  }

  async create(id: string, dto: CreateEnrollmentDto): Promise<StudentEnrollment> {
    const enrollDate = dto.enrollmentDate ?? new Date().toISOString().slice(0, 10);
    await execute(
      `INSERT INTO student_enrollments (id, student_id, batch_id, enrollment_date) VALUES (?, ?, ?, ?)`,
      [id, dto.studentId, dto.batchId, enrollDate],
    );
    return (await this.findById(id))!;
  }

  async updatePaymentStatus(id: string, status: string): Promise<StudentEnrollment> {
    await execute('UPDATE student_enrollments SET payment_status = ? WHERE id = ?', [status, id]);
    return (await this.findById(id))!;
  }

  async drop(id: string): Promise<StudentEnrollment> {
    await execute("UPDATE student_enrollments SET status = 'Dropped' WHERE id = ?", [id]);
    return (await this.findById(id))!;
  }

  async countActiveByBatch(batchId: string): Promise<number> {
    const rows = await query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM student_enrollments WHERE batch_id = ? AND status = 'Active'",
      [batchId],
    );
    return (rows[0] as any).count;
  }
}

export const enrollmentRepository = new EnrollmentRepository();
