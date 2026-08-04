import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import RecentlyViewed from '../models/RecentlyViewed.js';
import SearchHistory from '../models/SearchHistory.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { aiSearch } from '../services/ai.service.js';

export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    sort = 'newest',
    search,
    supplier,
    featured,
  } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (brand) filter.brand = brand;
  if (supplier) filter.supplier = supplier;
  if (featured === 'true') filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
    if (req.user) {
      await SearchHistory.create({ user: req.user._id, query: search, type: 'keyword' });
    }
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    popular: { salesCount: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(Number(limit))
      .populate({ path: 'supplier', select: 'businessName companyLogo rating isVerified' }),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'supplier',
    select: 'businessName companyLogo rating reviewCount businessDescription phone email website address operatingHours',
  });
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  product.views += 1;
  await product.save();

  if (req.user) {
    let recent = await RecentlyViewed.findOne({ user: req.user._id });
    if (!recent) recent = await RecentlyViewed.create({ user: req.user._id, products: [] });
    recent.products = recent.products.filter((p) => p.product.toString() !== product._id.toString());
    recent.products.unshift({ product: product._id, viewedAt: new Date() });
    recent.products = recent.products.slice(0, 20);
    await recent.save();
  }

  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  if (!supplier) throw new ApiError(404, 'Supplier profile not found');

  const product = await Product.create({ ...req.body, supplier: supplier._id });
  supplier.totalProducts += 1;
  await supplier.save();

  await Category.findOneAndUpdate(
    { name: product.category },
    { $inc: { productCount: 1 } },
    { upsert: false }
  );

  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  const product = await Product.findOne({ _id: req.params.id, supplier: supplier._id });
  if (!product) throw new ApiError(404, 'Product not found');

  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  const product = await Product.findOne({ _id: req.params.id, supplier: supplier._id });
  if (!product) throw new ApiError(404, 'Product not found');

  product.isActive = false;
  await product.save();
  supplier.totalProducts = Math.max(0, supplier.totalProducts - 1);
  await supplier.save();

  res.json({ success: true, message: 'Product removed' });
});

export const duplicateProduct = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  const original = await Product.findOne({ _id: req.params.id, supplier: supplier._id });
  if (!original) throw new ApiError(404, 'Product not found');

  const copy = await Product.create({
    ...original.toObject(),
    _id: undefined,
    name: `${original.name} (Copy)`,
    sku: undefined,
    salesCount: 0,
    views: 0,
    reviewCount: 0,
    rating: 0,
  });

  res.status(201).json({ success: true, product: copy });
});

export const getFeatured = asyncHandler(async (req, res) => {
  const [featured, trending, popular] = await Promise.all([
    Product.find({ isActive: true, isFeatured: true }).limit(8).populate('supplier', 'businessName companyLogo rating'),
    Product.find({ isActive: true }).sort({ views: -1 }).limit(8).populate('supplier', 'businessName companyLogo rating'),
    Product.find({ isActive: true }).sort({ salesCount: -1 }).limit(8).populate('supplier', 'businessName companyLogo rating'),
  ]);
  res.json({ success: true, featured, trending, popular });
});

export const aiProductSearch = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) throw new ApiError(400, 'Search query required');

  const { products, filters } = await aiSearch(query, Product);
  if (req.user) {
    await SearchHistory.create({
      user: req.user._id,
      query,
      type: 'ai',
      resultsCount: products.length,
    });
  }

  res.json({ success: true, products, filters, query });
});

export const getSupplierProducts = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  const products = await Product.find({ supplier: supplier._id }).sort({ createdAt: -1 });
  res.json({ success: true, products });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ user: req.user._id });
  const threshold = Number(req.query.threshold) || 10;
  const products = await Product.find({ supplier: supplier._id, stock: { $lte: threshold }, isActive: true });
  res.json({ success: true, products });
});
