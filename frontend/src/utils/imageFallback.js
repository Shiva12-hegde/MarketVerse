export const DEFAULT_PRODUCT_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  Wearables: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  Accessories: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
  Computers: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
  Monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
  Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  Default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
};

export const getProductImage = (product) => {
  if (product?.images?.length && product.images[0] && !product.images[0].includes('via.placeholder.com')) {
    return product.images[0];
  }
  const category = product?.category || 'Default';
  return DEFAULT_PRODUCT_IMAGES[category] || DEFAULT_PRODUCT_IMAGES.Default;
};

export const handleImageError = (e, category = 'Default') => {
  e.target.onerror = null;
  e.target.src = DEFAULT_PRODUCT_IMAGES[category] || DEFAULT_PRODUCT_IMAGES.Default;
};
