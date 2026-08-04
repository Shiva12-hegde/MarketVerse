import { Router } from 'express';
import * as wishlist from '../controllers/wishlist.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('buyer', 'admin'));

router.get('/', wishlist.getWishlist);
router.post('/toggle', wishlist.toggleWishlist);
router.delete('/:productId', wishlist.removeFromWishlist);

export default router;
