import { query, execute } from '../database/connection.ts';
import type { MembershipPlan, MembershipPlanRow, CreateMembershipPlanDto, UpdateMembershipPlanDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

function toPlan(row: MembershipPlanRow & RowDataPacket): MembershipPlan {
  return {
    id: row.id,
    name: row.name,
    durationMonths: row.duration_months,
    price: row.price,
    sportsAccess: typeof row.sports_access === 'string' ? JSON.parse(row.sports_access) : row.sports_access,
    description: row.description ?? undefined,
    isActive: !!row.is_active,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
  };
}

export class MembershipPlanRepository {
  async findAll(): Promise<MembershipPlan[]> {
    const rows = await query<(MembershipPlanRow & RowDataPacket)[]>('SELECT * FROM membership_plans ORDER BY name');
    return rows.map(toPlan);
  }

  async findActive(): Promise<MembershipPlan[]> {
    const rows = await query<(MembershipPlanRow & RowDataPacket)[]>('SELECT * FROM membership_plans WHERE is_active = 1 ORDER BY name');
    return rows.map(toPlan);
  }

  async findById(id: string): Promise<MembershipPlan | null> {
    const rows = await query<(MembershipPlanRow & RowDataPacket)[]>('SELECT * FROM membership_plans WHERE id = ?', [id]);
    return rows.length > 0 ? toPlan(rows[0]) : null;
  }

  async create(id: string, dto: CreateMembershipPlanDto): Promise<MembershipPlan> {
    await execute(
      `INSERT INTO membership_plans (id, name, duration_months, price, sports_access, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, dto.name, dto.durationMonths, dto.price, JSON.stringify(dto.sportsAccess), dto.description ?? null],
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdateMembershipPlanDto): Promise<MembershipPlan> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.name !== undefined) { fields.push('name = ?'); params.push(dto.name); }
    if (dto.durationMonths !== undefined) { fields.push('duration_months = ?'); params.push(dto.durationMonths); }
    if (dto.price !== undefined) { fields.push('price = ?'); params.push(dto.price); }
    if (dto.sportsAccess !== undefined) { fields.push('sports_access = ?'); params.push(JSON.stringify(dto.sportsAccess)); }
    if (dto.description !== undefined) { fields.push('description = ?'); params.push(dto.description); }
    if (dto.isActive !== undefined) { fields.push('is_active = ?'); params.push(dto.isActive ? 1 : 0); }

    if (fields.length === 0) return (await this.findById(id))!;
    params.push(id);
    await execute(`UPDATE membership_plans SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async deactivate(id: string): Promise<MembershipPlan> {
    await execute('UPDATE membership_plans SET is_active = 0 WHERE id = ?', [id]);
    return (await this.findById(id))!;
  }
}

export const membershipPlanRepository = new MembershipPlanRepository();
