import { Router } from 'express';
import * as order from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', authorize('buyer', 'admin'), order.createOrder);
router.get('/my', authorize('buyer', 'admin'), order.getMyOrders);
router.get('/:id', authorize('buyer', 'admin'), order.getOrder);
router.put('/:id/cancel', authorize('buyer'), order.cancelOrder);
router.get('/', authorize('admin'), order.getAllOrders);
router.put('/:id/status', authorize('admin', 'supplier'), order.updateOrderStatus);

export default router;
