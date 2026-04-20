import { Router } from 'express';
import { sessionController } from '../controllers/SessionController.ts';

const router = Router();

router.get('/', (req, res, next) => sessionController.getAll(req, res, next));
router.post('/:bookingId/extend', (req, res, next) => sessionController.extend(req, res, next));

export default router;
