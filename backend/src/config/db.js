import mongoose from 'mongoose';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/marketverse';
  await mongoose.connect(uri);
  console.log('MongoDB connected');

  // Auto-seed demo accounts if database is fresh
  try {
    const existingBuyer = await User.findOne({ email: 'buyer@marketverse.ai' });
    if (!existingBuyer) {
      console.log('Seeding demo accounts into database...');
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
      await Cart.create({ user: supplierUser._id, items: [] });

      await Supplier.create({
        user: supplierUser._id,
        businessName: 'Meridian Trade Co.',
        businessDescription: 'A verified B2B supplier of textiles, packaging, and business essentials.',
        email: 'supplier@marketverse.ai',
        phone: '+91 9123456789',
        isVerified: true,
        rating: 4.8,
        reviewCount: 95,
      });
      console.log('Demo accounts seeded successfully!');
    }
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
};
