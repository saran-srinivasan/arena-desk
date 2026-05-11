import { query, execute } from '../database/connection.ts';
import type { Customer, CustomerRow, CreateCustomerDto, UpdateCustomerDto, CustomerType } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Helpers ──────────────────────────────────────────────────
function toISO(val: Date | string): string {
  if (typeof val === 'string') {
    return new Date(val).toISOString();
  }
  return val.toISOString();
}

// ── Row → Model Mapper ───────────────────────────────────────
function toCustomer(row: CustomerRow & RowDataPacket): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    customerType: row.customer_type,
    preferredSport: row.preferred_sport,
    photoUrl: row.photo_url ?? undefined,
    createdAt: toISO(row.created_at),
    totalBookings: row.total_bookings,
  };
}

// ── Repository ────────────────────────────────────────────────
export class CustomerRepository {
  async findAll(): Promise<Customer[]> {
    const rows = await query<(CustomerRow & RowDataPacket)[]>(
      'SELECT * FROM customers ORDER BY name',
    );
    return rows.map(toCustomer);
  }

  async findById(id: string): Promise<Customer | null> {
    const rows = await query<(CustomerRow & RowDataPacket)[]>(
      'SELECT * FROM customers WHERE id = ?',
      [id],
    );
    return rows.length > 0 ? toCustomer(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const rows = await query<(CustomerRow & RowDataPacket)[]>(
      'SELECT * FROM customers WHERE email = ?',
      [email],
    );
    return rows.length > 0 ? toCustomer(rows[0]) : null;
  }

  async findByType(customerType: CustomerType): Promise<Customer[]> {
    const rows = await query<(CustomerRow & RowDataPacket)[]>(
      'SELECT * FROM customers WHERE customer_type = ? ORDER BY name',
      [customerType],
    );
    return rows.map(toCustomer);
  }

  async search(q: string): Promise<Customer[]> {
    const like = `%${q}%`;
    const rows = await query<(CustomerRow & RowDataPacket)[]>(
      'SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY name',
      [like, like, like],
    );
    return rows.map(toCustomer);
  }

  async create(id: string, dto: CreateCustomerDto): Promise<Customer> {
    await execute(
      `INSERT INTO customers (id, name, phone, email, customer_type, preferred_sport, photo_url, total_bookings)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, dto.name, dto.phone, dto.email, dto.customerType ?? 'Walk-in', dto.preferredSport, dto.photoUrl ?? null],
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.name !== undefined) { fields.push('name = ?'); params.push(dto.name); }
    if (dto.phone !== undefined) { fields.push('phone = ?'); params.push(dto.phone); }
    if (dto.email !== undefined) { fields.push('email = ?'); params.push(dto.email); }
    if (dto.customerType !== undefined) { fields.push('customer_type = ?'); params.push(dto.customerType); }
    if (dto.preferredSport !== undefined) { fields.push('preferred_sport = ?'); params.push(dto.preferredSport); }
    if (dto.photoUrl !== undefined) { fields.push('photo_url = ?'); params.push(dto.photoUrl); }

    if (fields.length === 0) return (await this.findById(id))!;

    params.push(id);
    await execute(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    await execute('DELETE FROM customers WHERE id = ?', [id]);
  }

  async incrementBookingCount(customerId: string): Promise<void> {
    await execute(
      'UPDATE customers SET total_bookings = total_bookings + 1 WHERE id = ?',
      [customerId],
    );
  }
}

export const customerRepository = new CustomerRepository();
