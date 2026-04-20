import { Router } from 'express';
import resourceRoutes from './resourceRoutes.ts';
import customerRoutes from './customerRoutes.ts';
import bookingRoutes from './bookingRoutes.ts';
import sessionRoutes from './sessionRoutes.ts';

const router = Router();

router.use('/resources', resourceRoutes);
router.use('/customers', customerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/sessions', sessionRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
