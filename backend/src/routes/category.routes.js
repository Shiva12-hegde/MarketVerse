import { Router } from 'express';
import * as category from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', category.getCategories);
router.get('/:slug', category.getCategory);
router.post('/', protect, authorize('admin'), category.createCategory);

export default router;
