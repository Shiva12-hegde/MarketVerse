import { Router } from 'express';
import * as supplier from '../controllers/supplier.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/profile', protect, authorize('supplier'), supplier.getSupplierProfile);
router.put('/profile', protect, authorize('supplier'), supplier.updateSupplierProfile);
router.get('/dashboard', protect, authorize('supplier'), supplier.getSupplierDashboard);
router.get('/orders', protect, authorize('supplier'), supplier.getSupplierOrders);
router.put('/orders/:orderId', protect, authorize('supplier'), supplier.updateSupplierOrderStatus);
router.get('/:id', supplier.getSupplierById);

export default router;
