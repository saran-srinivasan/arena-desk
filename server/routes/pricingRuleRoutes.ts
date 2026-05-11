import { Router } from 'express';
import { pricingRuleController } from '../controllers/PricingRuleController.ts';

const router = Router();

router.get('/', (req, res, next) => pricingRuleController.getAll(req, res, next));
router.get('/:id', (req, res, next) => pricingRuleController.getById(req, res, next));
router.post('/', (req, res, next) => pricingRuleController.create(req, res, next));
router.put('/:id', (req, res, next) => pricingRuleController.update(req, res, next));
router.delete('/:id', (req, res, next) => pricingRuleController.delete(req, res, next));

export default router;
