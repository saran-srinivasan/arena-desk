import { Router } from 'express';
import { attendanceController } from '../controllers/AttendanceController.ts';

const router = Router();

router.get('/batch/:batchId/date/:date', (req, res, next) => attendanceController.getByBatchAndDate(req, res, next));
router.post('/', (req, res, next) => attendanceController.mark(req, res, next));
router.post('/bulk', (req, res, next) => attendanceController.bulkMark(req, res, next));

export default router;
