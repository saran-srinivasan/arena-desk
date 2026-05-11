import { Router } from 'express';
import { resourceController } from '../controllers/ResourceController.ts';

const router = Router();

router.get('/', (req, res, next) => {
  if (req.query.sport) {
    return resourceController.getBySport(req, res, next);
  }
  return resourceController.getAll(req, res, next);
});
router.get('/:id', (req, res, next) => resourceController.getById(req, res, next));
router.post('/', (req, res, next) => resourceController.create(req, res, next));
router.put('/:id', (req, res, next) => resourceController.update(req, res, next));
router.delete('/:id', (req, res, next) => resourceController.delete(req, res, next));

export default router;
