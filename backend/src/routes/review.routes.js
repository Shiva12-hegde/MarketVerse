import { Router } from 'express';
import * as review from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', review.getProductReviews);
router.post('/', protect, authorize('buyer', 'admin'), review.createReview);
router.put('/:id/reply', protect, authorize('supplier', 'admin'), review.replyToReview);
router.delete('/:id', protect, review.deleteReview);

export default router;
