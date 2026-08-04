import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));

  const [
    totalUsers,
    totalSuppliers,
    totalProducts,
    totalOrders,
    newUsersThisMonth,
    newOrdersToday,
    usersByRole,
    ordersByStatus,
    revenueResult,
    topProducts,
    topCategories,
    recentOrders,
    monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments(),
    Supplier.countDocuments({ isVerified: true }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: { $in: ['completed', 'shipped'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, gmv: { $sum: '$subtotal' } } },
    ]),
    Product.find({ isActive: true }).sort({ salesCount: -1 }).limit(5).select('name category salesCount price'),
    Category.find().sort({ productCount: -1 }).limit(5).select('name productCount icon'),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('buyer', 'name email'),
    Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
  ]);

  const revenue = revenueResult[0] || { totalRevenue: 0, gmv: 0 };
  const featuredProducts = await Product.countDocuments({ isFeatured: true });
  const pendingOrders = await Order.countDocuments({ status: 'pending' });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalSuppliers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue.totalRevenue,
      gmv: revenue.gmv,
      newUsersThisMonth,
      newOrdersToday,
      featuredProducts,
      pendingOrders,
    },
    usersByRole: Object.fromEntries(usersByRole.map((u) => [u._id, u.count])),
    ordersByStatus: Object.fromEntries(ordersByStatus.map((o) => [o._id, o.count])),
    topProducts,
    topCategories,
    recentOrders,
    monthlyRevenue: monthlyRevenue.reverse(),
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user._id.toString() === req.user._id.toString()) throw new ApiError(400, 'Cannot modify your own account');

  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  await user.save();

  res.json({ success: true, user });
});

export const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, isActive } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('supplier', 'businessName companyLogo isVerified'),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { isFeatured, isActive } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  if (isFeatured !== undefined) product.isFeatured = isFeatured;
  if (isActive !== undefined) product.isActive = isActive;
  await product.save();

  res.json({ success: true, product });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('buyer', 'name email avatar'),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    orders,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});
