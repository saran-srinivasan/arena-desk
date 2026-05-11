import { query, execute } from '../database/connection.ts';
import type { Coach, CoachRow, CreateCoachDto, UpdateCoachDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

function toCoach(row: CoachRow & RowDataPacket): Coach {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    sportSpecializations: typeof row.sport_specializations === 'string' ? JSON.parse(row.sport_specializations) : row.sport_specializations,
    photoUrl: row.photo_url ?? undefined,
    status: row.status,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
  };
}

export class CoachRepository {
  async findAll(): Promise<Coach[]> {
    const rows = await query<(CoachRow & RowDataPacket)[]>('SELECT * FROM coaches ORDER BY name');
    return rows.map(toCoach);
  }

  async findActive(): Promise<Coach[]> {
    const rows = await query<(CoachRow & RowDataPacket)[]>("SELECT * FROM coaches WHERE status = 'Active' ORDER BY name");
    return rows.map(toCoach);
  }

  async findById(id: string): Promise<Coach | null> {
    const rows = await query<(CoachRow & RowDataPacket)[]>('SELECT * FROM coaches WHERE id = ?', [id]);
    return rows.length > 0 ? toCoach(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Coach | null> {
    const rows = await query<(CoachRow & RowDataPacket)[]>('SELECT * FROM coaches WHERE email = ?', [email]);
    return rows.length > 0 ? toCoach(rows[0]) : null;
  }

  async create(id: string, dto: CreateCoachDto): Promise<Coach> {
    await execute(
      `INSERT INTO coaches (id, name, phone, email, sport_specializations, photo_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, dto.name, dto.phone, dto.email, JSON.stringify(dto.sportSpecializations), dto.photoUrl ?? null],
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdateCoachDto): Promise<Coach> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.name !== undefined) { fields.push('name = ?'); params.push(dto.name); }
    if (dto.phone !== undefined) { fields.push('phone = ?'); params.push(dto.phone); }
    if (dto.email !== undefined) { fields.push('email = ?'); params.push(dto.email); }
    if (dto.sportSpecializations !== undefined) { fields.push('sport_specializations = ?'); params.push(JSON.stringify(dto.sportSpecializations)); }
    if (dto.photoUrl !== undefined) { fields.push('photo_url = ?'); params.push(dto.photoUrl); }
    if (dto.status !== undefined) { fields.push('status = ?'); params.push(dto.status); }

    if (fields.length === 0) return (await this.findById(id))!;
    params.push(id);
    await execute(`UPDATE coaches SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async deactivate(id: string): Promise<Coach> {
    await execute("UPDATE coaches SET status = 'Inactive' WHERE id = ?", [id]);
    return (await this.findById(id))!;
  }
}

export const coachRepository = new CoachRepository();
