import { query, execute } from '../database/connection.ts';
import type { PricingRule, PricingRuleRow, CreatePricingRuleDto, UpdatePricingRuleDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

function toPricingRule(row: PricingRuleRow & RowDataPacket): PricingRule {
  return {
    id: row.id,
    sport: row.sport,
    hourlyRate: row.hourly_rate,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
  };
}

export class PricingRuleRepository {
  async findAll(): Promise<PricingRule[]> {
    const rows = await query<(PricingRuleRow & RowDataPacket)[]>('SELECT * FROM pricing_rules ORDER BY sport ASC');
    return rows.map(toPricingRule);
  }

  async findById(id: string): Promise<PricingRule | null> {
    const rows = await query<(PricingRuleRow & RowDataPacket)[]>('SELECT * FROM pricing_rules WHERE id = ?', [id]);
    return rows.length > 0 ? toPricingRule(rows[0]) : null;
  }

  async create(id: string, dto: CreatePricingRuleDto): Promise<PricingRule> {
    await execute(
      `INSERT INTO pricing_rules (id, sport, hourly_rate) VALUES (?, ?, ?)`,
      [id, dto.sport, dto.hourlyRate]
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdatePricingRuleDto): Promise<PricingRule> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.hourlyRate !== undefined) { fields.push('hourly_rate = ?'); params.push(dto.hourlyRate); }

    if (fields.length === 0) return (await this.findById(id))!;
    params.push(id);
    await execute(`UPDATE pricing_rules SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    await execute('DELETE FROM pricing_rules WHERE id = ?', [id]);
  }
}

export const pricingRuleRepository = new PricingRuleRepository();
