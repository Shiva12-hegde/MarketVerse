import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import Supplier from '../models/Supplier.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateOrderNumber = () => `MV${Date.now()}${Math.floor(Math.random() * 1000)}`;

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, paymentMethod = 'cod', notes } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart?.items?.length) throw new ApiError(400, 'Cart is empty');

  const items = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) throw new ApiError(400, `Product unavailable: ${item.product?._id}`);
    if (product.stock < item.quantity) throw new ApiError(400, `Insufficient stock for ${product.name}`);

    const price = product.price - (product.price * product.discount) / 100;
    subtotal += price * item.quantity;

    items.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price,
      quantity: item.quantity,
      supplier: product.supplier,
    });

    product.stock -= item.quantity;
    product.salesCount += item.quantity;
    await product.save();
  }

  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + tax + shipping;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    buyer: req.user._id,
    items,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    subtotal,
    tax,
    shipping,
    total,
    paymentMethod,
    notes,
    timeline: [{ status: 'pending', note: 'Order placed successfully' }],
  });

  cart.items = [];
  await cart.save();

  await Notification.create({
    user: req.user._id,
    type: 'order_placed',
    title: 'Order Placed',
    message: `Your order ${order.orderNumber} has been placed successfully.`,
    link: `/buyer/orders/${order._id}`,
  });

  const supplierIds = [...new Set(items.map((i) => i.supplier.toString()))];
  for (const sid of supplierIds) {
    const supplier = await Supplier.findById(sid);
    if (supplier) {
      supplier.totalOrders += 1;
      await supplier.save();
      await Notification.create({
        user: supplier.user,
        type: 'order_placed',
        title: 'New Order Received',
        message: `New order ${order.orderNumber} received.`,
        link: `/supplier/orders`,
      });
    }
  }

  res.status(201).json({ success: true, order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id }).populate('items.product');
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (!['pending', 'preparing'].includes(order.status)) {
    throw new ApiError(400, 'Order cannot be cancelled at this stage');
  }

  order.status = 'cancelled';
  order.timeline.push({ status: 'cancelled', note: 'Cancelled by buyer' });
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, salesCount: -item.quantity },
    });
  }

  res.json({ success: true, order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('buyer', 'name email');
  res.json({ success: true, orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.status = req.body.status;
  order.timeline.push({ status: req.body.status, note: req.body.note || '' });
  await order.save();

  await Notification.create({
    user: order.buyer,
    type: 'order_shipped',
    title: 'Order Updated',
    message: `Your order ${order.orderNumber} is now ${req.body.status.replace(/_/g, ' ')}.`,
    link: `/buyer/orders/${order._id}`,
  });

  res.json({ success: true, order });
});
