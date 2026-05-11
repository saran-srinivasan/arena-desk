import { query, execute } from '../database/connection.ts';
import type { Membership, MembershipRow, CreateMembershipDto, UpdateMembershipDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Helpers ──────────────────────────────────────────────────
function toISO(val: Date | string): string {
  if (typeof val === 'string') {
    return new Date(val).toISOString();
  }
  return val.toISOString();
}

function toMembership(row: MembershipRow & RowDataPacket): Membership {
  return {
    id: row.id,
    customerId: row.customer_id,
    planId: row.plan_id,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    paymentStatus: row.payment_status,
    autoRenew: !!row.auto_renew,
    notes: row.notes ?? undefined,
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
    customerName: row.customer_name,
    planName: row.plan_name,
  };
}

const JOIN_SELECT = `
  SELECT m.*, c.name AS customer_name, p.name AS plan_name
  FROM memberships m
  JOIN customers c ON m.customer_id = c.id
  JOIN membership_plans p ON m.plan_id = p.id
`;

export class MembershipRepository {
  async findAll(): Promise<Membership[]> {
    const rows = await query<(MembershipRow & RowDataPacket)[]>(`${JOIN_SELECT} ORDER BY m.created_at DESC`);
    return rows.map(toMembership);
  }

  async findByCustomer(customerId: string): Promise<Membership[]> {
    const rows = await query<(MembershipRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE m.customer_id = ? ORDER BY m.start_date DESC`, [customerId]);
    return rows.map(toMembership);
  }

  async findById(id: string): Promise<Membership | null> {
    const rows = await query<(MembershipRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE m.id = ?`, [id]);
    return rows.length > 0 ? toMembership(rows[0]) : null;
  }

  async create(id: string, dto: CreateMembershipDto, endDate: string): Promise<Membership> {
    await execute(
      `INSERT INTO memberships (id, customer_id, plan_id, start_date, end_date, auto_renew, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.customerId, dto.planId, dto.startDate, endDate, dto.autoRenew ? 1 : 0, dto.notes ?? null],
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdateMembershipDto): Promise<Membership> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.status !== undefined) { fields.push('status = ?'); params.push(dto.status); }
    if (dto.paymentStatus !== undefined) { fields.push('payment_status = ?'); params.push(dto.paymentStatus); }
    if (dto.autoRenew !== undefined) { fields.push('auto_renew = ?'); params.push(dto.autoRenew ? 1 : 0); }
    if (dto.notes !== undefined) { fields.push('notes = ?'); params.push(dto.notes); }

    if (fields.length === 0) return (await this.findById(id))!;
    params.push(id);
    await execute(`UPDATE memberships SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async cancel(id: string): Promise<Membership> {
    await execute("UPDATE memberships SET status = 'Cancelled' WHERE id = ?", [id]);
    return (await this.findById(id))!;
  }

  async findExpiring(days: number): Promise<Membership[]> {
    const rows = await query<(MembershipRow & RowDataPacket)[]>(
      `${JOIN_SELECT} WHERE m.status = 'Active' AND m.end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) ORDER BY m.end_date`,
      [days],
    );
    return rows.map(toMembership);
  }
}

export const membershipRepository = new MembershipRepository();
