import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware.
 *
 * Catches all errors forwarded via next(err) throughout the application.
 * - Operational errors (ApiError instances): safe message returned to client.
 * - Mongoose validation errors: mapped to 400 with field-level details.
 * - Mongoose CastError (invalid ObjectId): mapped to 400.
 * - Mongoose duplicate key (code 11000): mapped to 409.
 * - JWT errors: mapped to 401.
 * - Unknown errors: 500 with generic message (detail logged server-side only).
 */
export const errorHandler = (err, req, res, _next) => {
  let error = err;

  // --- Mongoose: invalid ObjectId ---
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // --- Mongoose: duplicate key ---
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `A record with this ${field} already exists.`);
  }

  // --- Mongoose: validation error ---
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(400, 'Validation failed', messages);
  }

  // --- JWT: token errors ---
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Your session has expired. Please log in again.');
  }

  // --- Unhandled / programmer errors ---
  if (!error.isOperational) {
    logger.error('Unhandled error:', err);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'An unexpected error occurred.';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && !error.isOperational && { stack: err.stack }),
  });
};

/**
 * 404 handler — must be registered after all routes.
 */
export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
