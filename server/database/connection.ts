import mysql from 'mysql2/promise';
import { config } from '../config.ts';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      connectionLimit: config.db.connectionLimit,
      waitForConnections: config.db.waitForConnections,
      queueLimit: config.db.queueLimit,
      // Return dates as strings to avoid timezone issues
      dateStrings: true,
    });
  }
  return pool;
}

/**
 * Execute a parameterized SQL query using the connection pool.
 * Returns typed rows. Use for SELECT queries.
 */
export async function query<T extends mysql.RowDataPacket[]>(
  sql: string,
  params?: unknown[],
): Promise<T> {
  const p = getPool();
  const [rows] = await p.execute<T>(sql, params);
  return rows;
}

/**
 * Execute an INSERT/UPDATE/DELETE query.
 * Returns the ResultSetHeader with affectedRows, insertId, etc.
 */
export async function execute(
  sql: string,
  params?: unknown[],
): Promise<mysql.ResultSetHeader> {
  const p = getPool();
  const [result] = await p.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}

/**
 * Gracefully close the connection pool.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('  ✓ Database pool closed');
  }
}
