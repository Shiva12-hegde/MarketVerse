import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  configureCloudinary();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
