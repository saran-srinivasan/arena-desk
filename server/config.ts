import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(import.meta.dirname, '..', '.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'arena_desk',
    connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    waitForConnections: true,
    queueLimit: 0,
  },
} as const;
