import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Establishes a connection to MongoDB Atlas.
 * Exits the process if the connection fails — there is no point running
 * the server without a database.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Graceful disconnect on app termination
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
});
