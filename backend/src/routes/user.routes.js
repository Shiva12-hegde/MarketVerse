import { Router } from 'express';
import * as user from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/addresses', user.getAddresses);
router.post('/addresses', user.createAddress);
router.put('/addresses/:id', user.updateAddress);
router.delete('/addresses/:id', user.deleteAddress);
router.get('/recently-viewed', user.getRecentlyViewed);
router.get('/search-history', user.getSearchHistory);

router.get('/admin/dashboard', authorize('admin'), user.getAdminDashboard);
router.get('/admin/users', authorize('admin'), user.getAllUsers);
router.put('/admin/users/:id/toggle', authorize('admin'), user.toggleUserStatus);
router.delete('/admin/products/:id', authorize('admin'), user.adminDeleteProduct);

export default router;
