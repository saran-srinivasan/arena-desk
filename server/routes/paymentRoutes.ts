import { Router } from 'express';
import { paymentController } from '../controllers/PaymentController.ts';

const router = Router();

router.get('/', (req, res, next) => paymentController.getAll(req, res, next));
router.get('/customer/:customerId', (req, res, next) => paymentController.getByCustomer(req, res, next));
router.post('/', (req, res, next) => paymentController.create(req, res, next));
router.patch('/:id/status', (req, res, next) => paymentController.updateStatus(req, res, next));

export default router;
