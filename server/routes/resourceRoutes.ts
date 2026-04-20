import { Router } from 'express';
import { resourceController } from '../controllers/ResourceController.ts';

const router = Router();

router.get('/', (req, res, next) => resourceController.getAll(req, res, next));
router.get('/:id', (req, res, next) => resourceController.getById(req, res, next));

export default router;
