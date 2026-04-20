import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.ts';

/**
 * Global error handler middleware.
 * Catches AppError subclasses and unhandled errors, returning consistent JSON.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log the error
  console.error(`  ✗ Error: ${err.message}`);
  if (!(err instanceof AppError)) {
    console.error(err.stack);
  }

  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      success: false,
      error: err.message,
      code: err.code,
    };

    // Include conflicts array for ConflictError
    if ('conflicts' in err && (err as any).conflicts) {
      body.conflicts = (err as any).conflicts;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Unhandled errors
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
