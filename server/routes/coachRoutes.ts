import { Router } from 'express';
import { coachController } from '../controllers/CoachController.ts';

const router = Router();

router.get('/', (req, res, next) => coachController.getAll(req, res, next));
router.get('/:id', (req, res, next) => coachController.getById(req, res, next));
router.get('/:id/performance', (req, res, next) => coachController.getPerformance(req, res, next));
router.post('/', (req, res, next) => coachController.create(req, res, next));
router.put('/:id', (req, res, next) => coachController.update(req, res, next));
router.patch('/:id/deactivate', (req, res, next) => coachController.deactivate(req, res, next));

export default router;
