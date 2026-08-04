const CATEGORY_KEYWORDS = {
  Fabrics: ['fabric', 'cotton', 'linen', 'silk', 'denim', 'rayon', 'textile', 'yard', 'metre', 'meter', 'gsm'],
  Apparel: ['shirt', 'dress', 'kurta', 't-shirt', 'uniform', 'garment', 'apparel', 'clothing'],
  Packaging: ['box', 'carton', 'pouch', 'bag', 'label', 'packaging', 'corrugated', 'tape'],
  Industrial: ['steel', 'tool', 'safety', 'bearing', 'valve', 'machine', 'industrial', 'hardware'],
  Office: ['paper', 'printer', 'stationery', 'desk', 'chair', 'office', 'notebook'],
  Home: ['kitchen', 'cleaning', 'home', 'decor', 'lighting', 'storage'],
};

const BRAND_PATTERNS = [
  'Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'Asus', 'Nike', 'Adidas',
  'LG', 'Boat', 'OnePlus', 'Xiaomi', 'Realme', 'Canon', 'Nikon', 'Philips',
];

function detectCategory(text) {
  const lower = text.toLowerCase();
  let best = { category: 'Fabrics', score: 0 };
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > best.score) best = { category: cat, score };
  }
  return best.category;
}

function detectBrand(text) {
  for (const brand of BRAND_PATTERNS) {
    if (text.toLowerCase().includes(brand.toLowerCase())) return brand;
  }
  return '';
}

function detectSubcategory(text, category) {
  const lower = text.toLowerCase();
  const subs = {
    Fabrics: { Cotton: ['cotton'], Linen: ['linen'], Silk: ['silk'], Denim: ['denim'] },
    Apparel: { Uniforms: ['uniform'], Shirts: ['shirt'], Dresses: ['dress', 'kurta'] },
  };
  const map = subs[category] || {};
  for (const [sub, keys] of Object.entries(map)) {
    if (keys.some((k) => lower.includes(k))) return sub;
  }
  return '';
}

function generateTags(text, category) {
  const tags = [category.toLowerCase()];
  const lower = text.toLowerCase();
  if (lower.includes('organic')) tags.push('organic');
  if (lower.includes('bulk')) tags.push('bulk-order');
  if (lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable')) tags.push('budget-friendly');
  if (lower.includes('premium') || lower.includes('pro')) tags.push('premium');
  if (lower.includes('student')) tags.push('student');
  if (lower.includes('lightweight')) tags.push('lightweight');
  return [...new Set(tags)];
}

export async function categorizeProduct(productName) {
  const category = detectCategory(productName);
  const brand = detectBrand(productName);
  const subcategory = detectSubcategory(productName, category);
  const tags = generateTags(productName, category);
  return { category, subcategory, brand, tags };
}

export async function generateProductDescription(productName) {
  const { category, brand, tags } = await categorizeProduct(productName);
  const description = `Discover the ${productName} — a premium ${category.toLowerCase()} product${brand ? ` from ${brand}` : ''}. Designed for quality and reliability, this item offers excellent value for buyers looking for trusted marketplace listings. Ideal for everyday use with features that meet modern standards.`;
  const highlights = [
    `High-quality ${category.toLowerCase()} product`,
    brand ? `Authentic ${brand} brand` : 'Trusted supplier listing',
    'Fast dispatch from verified seller',
    'Secure checkout on MarketVerse AI',
  ];
  const seoKeywords = [productName, category, brand, ...tags].filter(Boolean);
  const specifications = {
    Category: category,
    Brand: brand || 'Generic',
    Condition: 'New',
    Warranty: 'Standard manufacturer warranty',
  };
  return { description, highlights, seoKeywords, specifications, category, brand, tags };
}

function parseAiQuery(query) {
  const lower = query.toLowerCase();
  const filters = {};

  const priceMatch = lower.match(/under\s*[₹$]?\s*([\d,]+)/);
  if (priceMatch) filters.maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);

  const aboveMatch = lower.match(/above\s*[₹$]?\s*([\d,]+)/);
  if (aboveMatch) filters.minPrice = parseInt(aboveMatch[1].replace(/,/g, ''), 10);

  filters.category = detectCategory(query);

  const semanticMap = {
    cheap: ['budget', 'affordable', 'entry', 'basic'],
    cotton: ['cotton', 'textile', 'fabric'],
    fabric: ['textile', 'material', 'cotton', 'linen'],
    uniform: ['apparel', 'garment', 'bulk'],
  };

  const expandedTerms = [query];
  for (const [key, terms] of Object.entries(semanticMap)) {
    if (lower.includes(key)) expandedTerms.push(...terms);
  }
  filters.searchTerms = expandedTerms;

  return filters;
}

export async function aiSearch(query, Product) {
  const filters = parseAiQuery(query);
  const mongoFilter = { isActive: true };

  if (filters.maxPrice) mongoFilter.price = { ...mongoFilter.price, $lte: filters.maxPrice };
  if (filters.minPrice) mongoFilter.price = { ...mongoFilter.price, $gte: filters.minPrice };
  if (filters.category) mongoFilter.category = filters.category;

  const searchRegex = filters.searchTerms.map((t) => t.split(/\s+/)).flat().filter((w) => w.length > 2);
  if (searchRegex.length) {
    mongoFilter.$or = searchRegex.map((term) => ({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
        { brand: { $regex: term, $options: 'i' } },
      ],
    }));
  }

  let products = await Product.find(mongoFilter)
    .populate({ path: 'supplier', select: 'businessName companyLogo rating' })
    .limit(50)
    .lean();

  if (!products.length) {
    products = await Product.find({
      isActive: true,
      $text: { $search: query.replace(/under|above|with|₹|\$/gi, '') },
    })
      .populate({ path: 'supplier', select: 'businessName companyLogo rating' })
      .limit(50)
      .lean();
  }

  return { products, filters };
}

export async function getRecommendations(productId, Product) {
  const product = await Product.findById(productId);
  if (!product) return { similar: [], alsoBought: [] };

  const similar = await Product.find({
    _id: { $ne: productId },
    isActive: true,
    $or: [{ category: product.category }, { brand: product.brand }, { tags: { $in: product.tags } }],
  })
    .sort({ rating: -1, salesCount: -1 })
    .limit(8)
    .populate({ path: 'supplier', select: 'businessName companyLogo rating' })
    .lean();

  const alsoBought = await Product.find({
    _id: { $ne: productId },
    isActive: true,
    category: product.category,
  })
    .sort({ salesCount: -1 })
    .limit(6)
    .populate({ path: 'supplier', select: 'businessName companyLogo rating' })
    .lean();

  return { similar, alsoBought };
}

export async function getPersonalizedRecommendations(userId, Product, RecentlyViewed) {
  const recent = await RecentlyViewed.findOne({ user: userId }).populate('products.product');
  const categories = recent?.products?.map((p) => p.product?.category).filter(Boolean) || [];

  if (!categories.length) {
    const trending = await Product.find({ isActive: true })
      .sort({ salesCount: -1, rating: -1 })
      .limit(12)
      .populate({ path: 'supplier', select: 'businessName companyLogo rating' })
      .lean();
    return trending;
  }

  return Product.find({ isActive: true, category: { $in: categories } })
    .sort({ rating: -1 })
    .limit(12)
    .populate({ path: 'supplier', select: 'businessName companyLogo rating' })
    .lean();
}

export async function chatAssistant(message, Product) {
  const lower = message.toLowerCase();
  const filters = parseAiQuery(message);
  const { products } = await aiSearch(message, Product);

  let response = 'Here are some products that might help:';
  if (lower.includes('fabric') || lower.includes('cotton') || lower.includes('linen')) {
    response = 'Based on your material requirements, I found these options sorted by relevance and ratings:';
  } else if (lower.includes('choose') || lower.includes('help')) {
    response = 'I can help you choose! Here are top-rated products matching your needs:';
  } else if (lower.includes('cheap') || lower.includes('budget')) {
    response = 'Looking for budget-friendly options? Here are affordable picks:';
  }

  return { response, products: products.slice(0, 6), filters };
}
