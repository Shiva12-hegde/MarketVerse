import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
};

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, images } = req.body;

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw new ApiError(400, 'You already reviewed this product');

  const order = await Order.findOne({
    buyer: req.user._id,
    'items.product': productId,
    status: 'completed',
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: !!order,
  });

  await updateProductRating(productId);
  res.status(201).json({ success: true, review });
});

export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'product',
    populate: { path: 'supplier' },
  });
  if (!review) throw new ApiError(404, 'Review not found');

  const supplierUserId = review.product.supplier.user?.toString();
  if (supplierUserId !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  review.supplierReply = req.body.reply;
  review.supplierReplyAt = new Date();
  await review.save();

  res.json({ success: true, review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new ApiError(404, 'Review not found');

  const productId = review.product;
  await review.deleteOne();
  await updateProductRating(productId);

  res.json({ success: true, message: 'Review deleted' });
});
