import { query, execute } from '../database/connection.ts';
import type { Payment, PaymentRow, CreatePaymentDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Helpers ──────────────────────────────────────────────────
function toISO(val: Date | string): string {
  if (typeof val === 'string') {
    return new Date(val).toISOString();
  }
  return val.toISOString();
}

function toMySQLDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toPayment(row: PaymentRow & RowDataPacket): Payment {
  return {
    id: row.id,
    customerId: row.customer_id,
    type: row.type,
    referenceId: row.reference_id,
    amount: row.amount,
    method: row.method,
    status: row.status,
    notes: row.notes ?? undefined,
    paidAt: row.paid_at ? toISO(row.paid_at) : undefined,
    createdAt: toISO(row.created_at),
    customerName: row.customer_name,
  };
}

const JOIN_SELECT = `
  SELECT p.*, c.name AS customer_name
  FROM payments p
  JOIN customers c ON p.customer_id = c.id
`;

export class PaymentRepository {
  async findAll(): Promise<Payment[]> {
    const rows = await query<(PaymentRow & RowDataPacket)[]>(`${JOIN_SELECT} ORDER BY p.created_at DESC`);
    return rows.map(toPayment);
  }

  async findByCustomer(customerId: string): Promise<Payment[]> {
    const rows = await query<(PaymentRow & RowDataPacket)[]>(
      `${JOIN_SELECT} WHERE p.customer_id = ? ORDER BY p.created_at DESC`,
      [customerId],
    );
    return rows.map(toPayment);
  }

  async findByReference(type: string, referenceId: string): Promise<Payment[]> {
    const rows = await query<(PaymentRow & RowDataPacket)[]>(
      `${JOIN_SELECT} WHERE p.type = ? AND p.reference_id = ? ORDER BY p.created_at DESC`,
      [type, referenceId],
    );
    return rows.map(toPayment);
  }

  async findById(id: string): Promise<Payment | null> {
    const rows = await query<(PaymentRow & RowDataPacket)[]>(`${JOIN_SELECT} WHERE p.id = ?`, [id]);
    return rows.length > 0 ? toPayment(rows[0]) : null;
  }

  async create(id: string, dto: CreatePaymentDto): Promise<Payment> {
    const paidAt = dto.method ? toMySQLDateTime(new Date()) : null;
    await execute(
      `INSERT INTO payments (id, customer_id, type, reference_id, amount, method, status, notes, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Completed', ?, ?)`,
      [id, dto.customerId, dto.type, dto.referenceId, dto.amount, dto.method, dto.notes ?? null, paidAt],
    );
    return (await this.findById(id))!;
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    const paidAt = status === 'Completed' ? toMySQLDateTime(new Date()) : null;
    await execute(
      'UPDATE payments SET status = ?, paid_at = COALESCE(?, paid_at) WHERE id = ?',
      [status, paidAt, id],
    );
    return (await this.findById(id))!;
  }
}

export const paymentRepository = new PaymentRepository();
