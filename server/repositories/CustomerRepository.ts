import { query, execute } from '../database/connection.ts';
import type { Customer, CustomerRow, CreateCustomerDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Row → Model Mapper ───────────────────────────────────────
function toCustomer(row: CustomerRow & RowDataPacket): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    preferredSport: row.preferred_sport,
    photoUrl: row.photo_url ?? undefined,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
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
      `INSERT INTO customers (id, name, phone, email, preferred_sport, photo_url, total_bookings)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [id, dto.name, dto.phone, dto.email, dto.preferredSport, dto.photoUrl ?? null],
    );
    return (await this.findById(id))!;
  }

  async incrementBookingCount(customerId: string): Promise<void> {
    await execute(
      'UPDATE customers SET total_bookings = total_bookings + 1 WHERE id = ?',
      [customerId],
    );
  }
}

export const customerRepository = new CustomerRepository();
