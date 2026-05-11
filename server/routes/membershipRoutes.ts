import { Router } from 'express';
import { membershipController } from '../controllers/MembershipController.ts';

const router = Router();

router.get('/', (req, res, next) => membershipController.getAll(req, res, next));
router.get('/customer/:customerId', (req, res, next) => membershipController.getByCustomer(req, res, next));
router.get('/:id', (req, res, next) => membershipController.getById(req, res, next));
router.post('/', (req, res, next) => membershipController.create(req, res, next));
router.put('/:id', (req, res, next) => membershipController.update(req, res, next));
router.patch('/:id/cancel', (req, res, next) => membershipController.cancel(req, res, next));

export default router;
