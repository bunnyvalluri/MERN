import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * MongoDB connection options optimized for production Atlas clusters.
 */
const MONGO_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  autoIndex: process.env.NODE_ENV !== 'production', // Build indexes automatically in dev, managed via migrations in prod
};

/**
 * Establishes a resilient connection to MongoDB Atlas.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('FATAL: MONGODB_URI is not defined in environment variables.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, MONGO_OPTIONS);
    logger.info(`MongoDB connected successfully: ${conn.connection.host} [DB: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

/**
 * Closes the database connection gracefully.
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
  } catch (err) {
    logger.error(`Error closing MongoDB connection: ${err.message}`);
  }
};

/**
 * Retrieves the current connection state and latency metric for health checks.
 */
export const getDBStatus = async () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;
  const isConnected = stateCode === 1;

  let pingMs = null;
  if (isConnected && mongoose.connection.db) {
    const start = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      pingMs = Date.now() - start;
    } catch {
      pingMs = null;
    }
  }

  return {
    state: states[stateCode] || 'unknown',
    isConnected,
    host: isConnected ? mongoose.connection.host : null,
    name: isConnected ? mongoose.connection.name : null,
    pingMs,
  };
};

// ─── Connection Lifecycle Event Listeners ─────────────────────────────────────
mongoose.connection.on('connected', () => {
  logger.info('Mongoose event: Connection established.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose event: Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose event: Connection lost.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose event: Reconnected to MongoDB cluster.');
});

export default connectDB;
