import { Router } from 'express';
import * as cart from '../controllers/cart.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('buyer', 'admin'));

router.get('/', cart.getCart);
router.get('/summary', cart.getCartSummary);
router.post('/add', cart.addToCart);
router.put('/update', cart.updateCartItem);
router.delete('/clear', cart.clearCart);
router.delete('/:productId', cart.removeFromCart);

export default router;
