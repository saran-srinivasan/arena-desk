import express from 'express';
import cors from 'cors';
import { config } from './config.ts';
import { getPool, closePool } from './database/connection.ts';
import { seedDatabase } from './database/seed.ts';
import apiRoutes from './routes/index.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { requestLogger } from './middleware/requestLogger.ts';

const app = express();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Startup ───────────────────────────────────────────────────
async function start() {
  try {
    console.log('\n⚡ ArenaDesk API Server');
    console.log('─'.repeat(40));

    // Test database connection
    const pool = getPool();
    const conn = await pool.getConnection();
    console.log('  ✓ Database connected');
    conn.release();

    // Seed data
    await seedDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`  ✓ Server listening on port ${config.port}`);
      console.log(`  ✓ API available at http://localhost:${config.port}/api`);
      console.log('─'.repeat(40) + '\n');
    });
  } catch (err) {
    console.error('\n  ✗ Failed to start server:', err);
    process.exit(1);
  }
}

// ── Graceful Shutdown ─────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`\n  ⟳ Received ${signal}, shutting down...`);
  await closePool();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
