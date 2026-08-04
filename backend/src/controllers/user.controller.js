import Address from '../models/Address.js';
import RecentlyViewed from '../models/RecentlyViewed.js';
import SearchHistory from '../models/SearchHistory.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Supplier from '../models/Supplier.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1 });
  res.json({ success: true, addresses });
});

export const createAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }
  const address = await Address.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, address });
});

export const updateAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!address) throw new ApiError(404, 'Address not found');
  res.json({ success: true, address });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const recent = await RecentlyViewed.findOne({ user: req.user._id }).populate({
    path: 'products.product',
    populate: { path: 'supplier', select: 'businessName companyLogo rating' },
  });
  res.json({ success: true, recentlyViewed: recent?.products || [] });
});

export const getSearchHistory = asyncHandler(async (req, res) => {
  const history = await SearchHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, history });
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [users, suppliers, products, orders, revenue] = await Promise.all([
    User.countDocuments(),
    Supplier.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('buyer', 'name email');

  res.json({
    success: true,
    stats: { users, suppliers, products, orders, revenue: revenue[0]?.total || 0 },
    recentOrders,
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
});

export const adminDeleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Product removed' });
});
