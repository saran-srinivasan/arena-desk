import { query, execute } from '../database/connection.ts';
import type { Resource, ResourceRow, CreateResourceDto, UpdateResourceDto } from '../types/index.ts';
import type { RowDataPacket } from 'mysql2/promise';

// ── Row → Model Mapper ───────────────────────────────────────
function toResource(row: ResourceRow & RowDataPacket): Resource {
  const sports = typeof row.supported_sports === 'string'
    ? JSON.parse(row.supported_sports)
    : row.supported_sports;

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    subType: row.sub_type ?? undefined,
    sharedGroup: row.shared_group ?? undefined,
    supportedSports: sports,
    maxCapacity: row.max_capacity,
  };
}

// ── Repository ────────────────────────────────────────────────
export class ResourceRepository {
  async findAll(): Promise<Resource[]> {
    const rows = await query<(ResourceRow & RowDataPacket)[]>(
      'SELECT * FROM resources ORDER BY name',
    );
    return rows.map(toResource);
  }

  async findById(id: string): Promise<Resource | null> {
    const rows = await query<(ResourceRow & RowDataPacket)[]>(
      'SELECT * FROM resources WHERE id = ?',
      [id],
    );
    return rows.length > 0 ? toResource(rows[0]) : null;
  }

  async findBySport(sport: string): Promise<Resource[]> {
    const rows = await query<(ResourceRow & RowDataPacket)[]>(
      'SELECT * FROM resources WHERE JSON_CONTAINS(supported_sports, JSON_QUOTE(?)) ORDER BY name',
      [sport],
    );
    return rows.map(toResource);
  }

  async findBySharedGroup(group: string): Promise<Resource[]> {
    const rows = await query<(ResourceRow & RowDataPacket)[]>(
      'SELECT * FROM resources WHERE shared_group = ? ORDER BY name',
      [group],
    );
    return rows.map(toResource);
  }

  async create(id: string, dto: CreateResourceDto): Promise<Resource> {
    await execute(
      `INSERT INTO resources (id, name, type, sub_type, shared_group, supported_sports, max_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.name, dto.type, dto.subType ?? null, dto.sharedGroup ?? null, JSON.stringify(dto.supportedSports), dto.maxCapacity ?? 1]
    );
    return (await this.findById(id))!;
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.name !== undefined) { fields.push('name = ?'); params.push(dto.name); }
    if (dto.type !== undefined) { fields.push('type = ?'); params.push(dto.type); }
    if (dto.subType !== undefined) { fields.push('sub_type = ?'); params.push(dto.subType); }
    if (dto.sharedGroup !== undefined) { fields.push('shared_group = ?'); params.push(dto.sharedGroup); }
    if (dto.supportedSports !== undefined) { fields.push('supported_sports = ?'); params.push(JSON.stringify(dto.supportedSports)); }
    if (dto.maxCapacity !== undefined) { fields.push('max_capacity = ?'); params.push(dto.maxCapacity); }

    if (fields.length === 0) return (await this.findById(id))!;
    params.push(id);
    await execute(`UPDATE resources SET ${fields.join(', ')} WHERE id = ?`, params);
    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    await execute('DELETE FROM resources WHERE id = ?', [id]);
  }
}

export const resourceRepository = new ResourceRepository();
