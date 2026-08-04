import mongoose from 'mongoose';

const operatingHoursSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    businessDescription: { type: String, default: '' },
    companyLogo: { type: String, default: '' },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String, default: '' },
    gst: { type: String, default: '' },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    operatingHours: [operatingHoursSchema],
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      twitter: String,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Supplier', supplierSchema);
