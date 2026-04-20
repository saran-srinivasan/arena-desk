import { Router } from 'express';
import { bookingController } from '../controllers/BookingController.ts';

const router = Router();

router.get('/', (req, res, next) => bookingController.getAll(req, res, next));
router.post('/', (req, res, next) => bookingController.create(req, res, next));
router.post('/check-conflicts', (req, res, next) => bookingController.checkConflicts(req, res, next));
router.get('/:id', (req, res, next) => bookingController.getById(req, res, next));
router.patch('/:id', (req, res, next) => bookingController.update(req, res, next));
router.post('/:id/cancel', (req, res, next) => bookingController.cancel(req, res, next));
router.post('/:id/checkin', (req, res, next) => bookingController.checkIn(req, res, next));
router.post('/:id/complete', (req, res, next) => bookingController.complete(req, res, next));

export default router;
