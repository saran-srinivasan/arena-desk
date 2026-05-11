import { Router } from 'express';
import resourceRoutes from './resourceRoutes.ts';
import customerRoutes from './customerRoutes.ts';
import bookingRoutes from './bookingRoutes.ts';
import sessionRoutes from './sessionRoutes.ts';
import membershipPlanRoutes from './membershipPlanRoutes.ts';
import membershipRoutes from './membershipRoutes.ts';
import coachRoutes from './coachRoutes.ts';
import batchRoutes from './batchRoutes.ts';
import enrollmentRoutes from './enrollmentRoutes.ts';
import attendanceRoutes from './attendanceRoutes.ts';
import paymentRoutes from './paymentRoutes.ts';
import pricingRuleRoutes from './pricingRuleRoutes.ts';
import staffRoutes from './staffRoutes.ts';

const router = Router();

router.use('/resources', resourceRoutes);
router.use('/customers', customerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/sessions', sessionRoutes);
router.use('/membership-plans', membershipPlanRoutes);
router.use('/memberships', membershipRoutes);
router.use('/coaches', coachRoutes);
router.use('/batches', batchRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/pricing-rules', pricingRuleRoutes);
router.use('/staff', staffRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
