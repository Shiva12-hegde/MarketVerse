import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateCart = (query) =>
  query.populate({
    path: 'items.product',
    populate: { path: 'supplier', select: 'businessName companyLogo' },
  });

export const getCart = asyncHandler(async (req, res) => {
  let cart = await populateCart(Cart.findOne({ user: req.user._id }));
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  if (product.stock < quantity) throw new ApiError(400, 'Insufficient stock');

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  cart = await populateCart(Cart.findById(cart._id));
  res.json({ success: true, cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Cart not found');

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError(404, 'Item not in cart');

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const populated = await populateCart(Cart.findById(cart._id));
  res.json({ success: true, cart: populated });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Cart not found');

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();

  const populated = await populateCart(Cart.findById(cart._id));
  res.json({ success: true, cart: populated });
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

export const getCartSummary = asyncHandler(async (req, res) => {
  const cart = await populateCart(Cart.findOne({ user: req.user._id }));
  if (!cart?.items?.length) {
    return res.json({ success: true, subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 });
  }

  let subtotal = 0;
  let itemCount = 0;
  for (const item of cart.items) {
    if (!item.product) continue;
    const price = item.product.price - (item.product.price * item.product.discount) / 100;
    subtotal += price * item.quantity;
    itemCount += item.quantity;
  }

  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + tax + shipping;

  res.json({ success: true, subtotal, tax, shipping, total, itemCount });
});
