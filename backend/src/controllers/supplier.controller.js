import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSupplierProfile = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id }).populate('user', 'name email avatar');
  if (!supplier) throw new ApiError(404, 'Supplier profile not found');
  res.json({ success: true, supplier });
});

export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).populate('user', 'name avatar');
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  const products = await Product.find({ supplier: supplier._id, isActive: true }).limit(20);
  res.json({ success: true, supplier, products });
});

export const updateSupplierProfile = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate({ user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!supplier) throw new ApiError(404, 'Supplier profile not found');
  res.json({ success: true, supplier });
});

export const getSupplierDashboard = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  if (!supplier) throw new ApiError(404, 'Supplier profile not found');

  const productIds = (await Product.find({ supplier: supplier._id }).select('_id')).map((p) => p._id);

  const [products, lowStock, orders, revenue] = await Promise.all([
    Product.countDocuments({ supplier: supplier._id, isActive: true }),
    Product.countDocuments({ supplier: supplier._id, stock: { $lte: 10 }, isActive: true }),
    Order.countDocuments({ 'items.supplier': supplier._id }),
    Order.aggregate([
      { $match: { 'items.supplier': supplier._id, status: 'completed' } },
      { $unwind: '$items' },
      { $match: { 'items.supplier': supplier._id } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    ]),
  ]);

  const recentOrders = await Order.find({ 'items.supplier': supplier._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('buyer', 'name email');

  res.json({
    success: true,
    stats: {
      totalProducts: products,
      lowStock,
      totalOrders: orders,
      revenue: revenue[0]?.total || 0,
      rating: supplier.rating,
    },
    recentOrders,
  });
});

export const getSupplierOrders = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  const orders = await Order.find({ 'items.supplier': supplier._id })
    .sort({ createdAt: -1 })
    .populate('buyer', 'name email phone');
  res.json({ success: true, orders });
});

export const updateSupplierOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const supplier = await Supplier.findOne({ user: req.user._id });
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  const hasSupplierItem = order.items.some((i) => i.supplier?.toString() === supplier._id.toString());
  if (!hasSupplierItem) throw new ApiError(403, 'Not authorized for this order');

  order.status = status;
  order.timeline.push({ status, note: note || `Status updated to ${status}` });
  await order.save();

  res.json({ success: true, order });
});
