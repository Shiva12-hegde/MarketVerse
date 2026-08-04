import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Supplier from './models/Supplier.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';

dotenv.config();

const categories = [
  { name: 'Fabrics', slug: 'fabrics', icon: '🧵', subcategories: ['Cotton', 'Linen', 'Silk', 'Denim'] },
  { name: 'Apparel', slug: 'apparel', icon: '👕', subcategories: ['Uniforms', 'Shirts', 'Kurtas', 'Workwear'] },
  { name: 'Packaging', slug: 'packaging', icon: '📦', subcategories: ['Corrugated Boxes', 'Pouches', 'Labels', 'Tape'] },
  { name: 'Industrial', slug: 'industrial', icon: '🛠️', subcategories: ['Safety', 'Hardware', 'Tools', 'Components'] },
  { name: 'Office', slug: 'office', icon: '📋', subcategories: ['Paper', 'Stationery', 'Furniture', 'Printing'] },
  { name: 'Home', slug: 'home', icon: '🏠', subcategories: ['Kitchen', 'Storage', 'Cleaning', 'Decor'] },
];

const sampleProducts = [
  { name: 'Organic Cotton Poplin Fabric', category: 'Fabrics', subcategory: 'Cotton', brand: 'WeaveWorks', price: 320, discount: 10, stock: 450, tags: ['cotton', 'organic', 'fabric', 'bulk'], isFeatured: true },
  { name: 'Premium Linen Blend Fabric', category: 'Fabrics', subcategory: 'Linen', brand: 'Loom & Leaf', price: 520, discount: 8, stock: 180, tags: ['linen', 'fabric', 'premium'], isFeatured: true },
  { name: 'Mulberry Silk Dress Material', category: 'Fabrics', subcategory: 'Silk', brand: 'SilkRoute', price: 1150, discount: 12, stock: 90, tags: ['silk', 'fabric', 'dress'], isFeatured: true },
  { name: 'Indigo Stretch Denim Roll', category: 'Fabrics', subcategory: 'Denim', brand: 'DenimCraft', price: 690, discount: 5, stock: 130, tags: ['denim', 'fabric', 'apparel'], isFeatured: true },
  { name: 'Custom Cotton Polo Uniforms', category: 'Apparel', subcategory: 'Uniforms', brand: 'TeamThread', price: 480, discount: 15, stock: 250, tags: ['uniform', 'cotton', 'bulk'], isFeatured: true },
  { name: 'Industrial Safety Gloves Pack', category: 'Industrial', subcategory: 'Safety', brand: 'SafeGrip', price: 850, discount: 10, stock: 75, tags: ['safety', 'industrial', 'bulk'], isFeatured: false },
  { name: 'Corrugated Shipping Boxes Set', category: 'Packaging', subcategory: 'Corrugated Boxes', brand: 'PackRight', price: 1250, discount: 18, stock: 300, tags: ['packaging', 'boxes', 'bulk'], isFeatured: true },
  { name: 'Stand-Up Kraft Pouches', category: 'Packaging', subcategory: 'Pouches', brand: 'PackRight', price: 640, discount: 5, stock: 500, tags: ['packaging', 'pouch', 'kraft'], isFeatured: false },
  { name: 'A4 Copier Paper Bulk Pack', category: 'Office', subcategory: 'Paper', brand: 'OfficeBase', price: 380, discount: 6, stock: 400, tags: ['paper', 'office', 'bulk'], isFeatured: false },
  { name: 'Stainless Steel Storage Rack', category: 'Home', subcategory: 'Storage', brand: 'HomeCraft', price: 4200, discount: 10, stock: 40, tags: ['storage', 'home', 'steel'], isFeatured: false },
  { name: 'Heavy Duty Utility Cutter Set', category: 'Industrial', subcategory: 'Tools', brand: 'ForgeLine', price: 980, discount: 7, stock: 65, tags: ['tool', 'industrial', 'hardware'], isFeatured: false },
  { name: 'Printed Garment Care Labels', category: 'Packaging', subcategory: 'Labels', brand: 'LabelLoop', price: 280, discount: 0, stock: 1000, tags: ['labels', 'garment', 'packaging'], isFeatured: false },
];

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Supplier.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);

  console.log('Creating categories...');
  await Category.insertMany(categories);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@marketverse.ai',
    password: 'admin123',
    role: 'admin',
  });

  const buyer = await User.create({
    name: 'Demo Buyer',
    email: 'buyer@marketverse.ai',
    password: 'buyer123',
    role: 'buyer',
    phone: '+91 9876543210',
  });

  const supplierUser = await User.create({
    name: 'Meridian Trade Co.',
    email: 'supplier@marketverse.ai',
    password: 'supplier123',
    role: 'supplier',
    phone: '+91 9123456789',
  });

  await Cart.create({ user: buyer._id, items: [] });
  await Wishlist.create({ user: buyer._id, products: [] });
  await Cart.create({ user: admin._id, items: [] });
  await Wishlist.create({ user: admin._id, products: [] });

  const supplier = await Supplier.create({
    user: supplierUser._id,
    businessName: 'Meridian Trade Co.',
    businessDescription: 'A verified B2B supplier of textiles, packaging, and business essentials for growing retailers.',
    email: 'supplier@marketverse.ai',
    phone: '+91 9123456789',
    website: 'https://techsupply.example.com',
    gst: '27AABCT1234F1Z5',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    address: {
      street: '42 Industrial Area, Phase 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
    },
    operatingHours: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      day,
      open: '09:00',
      close: day === 'Sat' ? '14:00' : '18:00',
      closed: day === 'Sun',
    })),
    isVerified: true,
    rating: 4.7,
    reviewCount: 128,
  });

  console.log('Creating products...');
  const productImages = {
    fabric: 'https://images.unsplash.com/photo-1604325020592-6c4f37ec6f6e?w=600',
    packaging: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
    industrial: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600',
    office: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
    home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
  };

  const imageMap = {
    'Organic Cotton Poplin Fabric': productImages.fabric,
    'Premium Linen Blend Fabric': productImages.fabric,
    'Mulberry Silk Dress Material': productImages.fabric,
    'Indigo Stretch Denim Roll': productImages.fabric,
    'Custom Cotton Polo Uniforms': productImages.fabric,
    'Industrial Safety Gloves Pack': productImages.industrial,
    'Corrugated Shipping Boxes Set': productImages.packaging,
    'Stand-Up Kraft Pouches': productImages.packaging,
    'A4 Copier Paper Bulk Pack': productImages.office,
    'Stainless Steel Storage Rack': productImages.home,
    'Heavy Duty Utility Cutter Set': productImages.industrial,
    'Printed Garment Care Labels': productImages.packaging,
  };

  for (const p of sampleProducts) {
    await Product.create({
      ...p,
      description: `Quality ${p.name} available from a verified supplier. Built for dependable business procurement with flexible bulk quantities.`,
      images: [imageMap[p.name] || productImages.fabric],
      supplier: supplier._id,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      salesCount: Math.floor(Math.random() * 200),
      views: Math.floor(Math.random() * 500),
      highlights: ['Verified supplier', 'Fast delivery', 'Quality assured'],
      specifications: { Brand: p.brand, Category: p.category, Condition: 'New' },
    });
  }

  supplier.totalProducts = sampleProducts.length;
  await supplier.save();

  for (const cat of categories) {
    const count = sampleProducts.filter((p) => p.category === cat.name).length;
    await Category.findOneAndUpdate({ name: cat.name }, { productCount: count });
  }

  console.log('\n✅ Seed completed!\n');
  console.log('Demo accounts:');
  console.log('  Admin:    admin@marketverse.ai / admin123');
  console.log('  Buyer:    buyer@marketverse.ai / buyer123');
  console.log('  Supplier: supplier@marketverse.ai / supplier123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
