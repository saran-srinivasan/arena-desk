import { query } from '../database/connection.ts';
import type { Resource, ResourceRow } from '../types/index.ts';
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
}

export const resourceRepository = new ResourceRepository();
