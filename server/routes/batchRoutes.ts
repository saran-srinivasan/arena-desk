import { Router } from 'express';
import { batchController } from '../controllers/BatchController.ts';

const router = Router();

router.get('/', (req, res, next) => batchController.getAll(req, res, next));
router.get('/:id', (req, res, next) => batchController.getById(req, res, next));
router.post('/', (req, res, next) => batchController.create(req, res, next));
router.put('/:id', (req, res, next) => batchController.update(req, res, next));
router.delete('/:id', (req, res, next) => batchController.delete(req, res, next));

export default router;
