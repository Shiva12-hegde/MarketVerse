import { Router } from 'express';
import * as product from '../controllers/product.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, product.getProducts);
router.get('/featured', product.getFeatured);
router.get('/ai-search', optionalAuth, product.aiProductSearch);
router.get('/supplier/my', protect, authorize('supplier', 'admin'), product.getSupplierProducts);
router.get('/supplier/low-stock', protect, authorize('supplier'), product.getLowStockProducts);
router.get('/:id', optionalAuth, product.getProduct);
router.post('/', protect, authorize('supplier', 'admin'), product.createProduct);
router.put('/:id', protect, authorize('supplier', 'admin'), product.updateProduct);
router.delete('/:id', protect, authorize('supplier', 'admin'), product.deleteProduct);
router.post('/:id/duplicate', protect, authorize('supplier'), product.duplicateProduct);

export default router;
