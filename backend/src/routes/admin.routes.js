import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getUsers,
  updateUser,
  getProducts,
  updateProduct,
  getOrders,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/products', getProducts);
router.put('/products/:id', updateProduct);
router.get('/orders', getOrders);

export default router;
