import { Router } from 'express';
import { enrollmentController } from '../controllers/EnrollmentController.ts';

const router = Router();

router.get('/batch/:batchId', (req, res, next) => enrollmentController.getByBatch(req, res, next));
router.get('/student/:studentId', (req, res, next) => enrollmentController.getByStudent(req, res, next));
router.post('/', (req, res, next) => enrollmentController.create(req, res, next));
router.patch('/:id/drop', (req, res, next) => enrollmentController.drop(req, res, next));
router.patch('/:id/payment', (req, res, next) => enrollmentController.updatePaymentStatus(req, res, next));

export default router;
