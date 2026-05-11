import { query, execute } from '../database/connection.ts';
import type { Staff, StaffRow, CreateStaffDto, UpdateStaffDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

function toStaff(row: StaffRow & RowDataPacket): Staff {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone ?? undefined,
    status: row.status,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
  };
}

export class StaffRepository {
  async findAll(): Promise<Staff[]> {
    const rows = await query<(StaffRow & RowDataPacket)[]>('SELECT * FROM staff ORDER BY name ASC');
    return rows.map(toStaff);
  }

  async findById(id: string): Promise<Staff | null> {
    const rows = await query<(StaffRow & RowDataPacket)[]>('SELECT * FROM staff WHERE id = ?', [id]);
    return rows.length > 0 ? toStaff(rows[0]) : null;
  }

  async create(id: string, dto: CreateStaffDto): Promise<Staff> {
    await execute(
      `INSERT INTO staff (id, name, role, email, phone) VALUES (?, ?, ?, ?, ?)`,
      [id, dto.name, dto.role, dto.email, dto.phone ?? null]
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdateStaffDto): Promise<Staff> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.name !== undefined) { fields.push('name = ?'); params.push(dto.name); }
    if (dto.role !== undefined) { fields.push('role = ?'); params.push(dto.role); }
    if (dto.email !== undefined) { fields.push('email = ?'); params.push(dto.email); }
    if (dto.phone !== undefined) { fields.push('phone = ?'); params.push(dto.phone); }
    if (dto.status !== undefined) { fields.push('status = ?'); params.push(dto.status); }

    if (fields.length === 0) return (await this.findById(id))!;
    params.push(id);
    await execute(`UPDATE staff SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    await execute('DELETE FROM staff WHERE id = ?', [id]);
  }
}

export const staffRepository = new StaffRepository();
