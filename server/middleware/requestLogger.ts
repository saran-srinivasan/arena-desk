import type { Request, Response, NextFunction } from 'express';

/**
 * Logs each request: METHOD /path → STATUS (duration ms)
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`  ${method.padEnd(6)} ${originalUrl} → ${color}${status}${reset} (${duration}ms)`);
  });

  next();
}
