import { Router } from 'express';
import { customerController } from '../controllers/CustomerController.ts';

const router = Router();

router.get('/', (req, res, next) => customerController.getAll(req, res, next));
router.get('/:id', (req, res, next) => customerController.getById(req, res, next));
router.post('/', (req, res, next) => customerController.create(req, res, next));

export default router;
