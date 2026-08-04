import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: '' },
    images: [{ type: String }],
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    specifications: { type: Map, of: String, default: {} },
    brand: { type: String, default: '', index: true },
    tags: [{ type: String }],
    highlights: [{ type: String }],
    seoKeywords: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

productSchema.virtual('discountedPrice').get(function getDiscountedPrice() {
  return this.price - (this.price * this.discount) / 100;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
