import { Router } from 'express';
import { membershipPlanController } from '../controllers/MembershipPlanController.ts';

const router = Router();

router.get('/', (req, res, next) => membershipPlanController.getAll(req, res, next));
router.get('/active', (req, res, next) => membershipPlanController.getActive(req, res, next));
router.get('/:id', (req, res, next) => membershipPlanController.getById(req, res, next));
router.post('/', (req, res, next) => membershipPlanController.create(req, res, next));
router.put('/:id', (req, res, next) => membershipPlanController.update(req, res, next));
router.patch('/:id/deactivate', (req, res, next) => membershipPlanController.deactivate(req, res, next));

export default router;
