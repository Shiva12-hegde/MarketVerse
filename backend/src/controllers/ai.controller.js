import {
  categorizeProduct,
  generateProductDescription,
  getRecommendations,
  getPersonalizedRecommendations,
  chatAssistant,
  aiSearch,
} from '../services/ai.service.js';
import Product from '../models/Product.js';
import RecentlyViewed from '../models/RecentlyViewed.js';
import SearchHistory from '../models/SearchHistory.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const aiCategorize = asyncHandler(async (req, res) => {
  const { productName } = req.body;
  if (!productName) throw new ApiError(400, 'Product name required');
  const result = await categorizeProduct(productName);
  res.json({ success: true, ...result });
});

export const aiGenerateDescription = asyncHandler(async (req, res) => {
  const { productName } = req.body;
  if (!productName) throw new ApiError(400, 'Product name required');
  const result = await generateProductDescription(productName);
  res.json({ success: true, ...result });
});

export const aiGetRecommendations = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const result = await getRecommendations(productId, Product);
  res.json({ success: true, ...result });
});

export const aiPersonalized = asyncHandler(async (req, res) => {
  const products = await getPersonalizedRecommendations(req.user._id, Product, RecentlyViewed);
  res.json({ success: true, products });
});

export const aiChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw new ApiError(400, 'Message required');
  const result = await chatAssistant(message, Product);
  res.json({ success: true, ...result });
});

export const aiSemanticSearch = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) throw new ApiError(400, 'Query required');
  const { products, filters } = await aiSearch(query, Product);
  if (req.user) {
    await SearchHistory.create({ user: req.user._id, query, type: 'semantic', resultsCount: products.length });
  }
  res.json({ success: true, products, filters });
});
