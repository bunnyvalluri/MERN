import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware.
 *
 * Catches all errors forwarded via next(err) throughout the application.
 *
 * Error classification:
 *  - Mongoose CastError (invalid ObjectId)  → 400 BAD_REQUEST
 *  - Mongoose duplicate key (code 11000)     → 409 CONFLICT
 *  - Mongoose ValidationError               → 400 VALIDATION_ERROR
 *  - MongoDB network/timeout errors          → 503/504 SERVICE_UNAVAILABLE
 *  - JWT JsonWebTokenError                  → 401 UNAUTHORIZED
 *  - JWT TokenExpiredError                  → 401 TOKEN_EXPIRED
 *  - Operational ApiError                   → pass-through (safe message)
 *  - Unknown / programmer errors            → 500 INTERNAL_ERROR (generic to client)
 *
 * Response shape (every error):
 *  {
 *    success:   false,
 *    code:      "VALIDATION_ERROR",   // machine-readable, never changes
 *    status:    400,
 *    message:   "Validation failed.", // human-readable
 *    requestId: "uuid-v4",            // traceable to server logs
 *    timestamp: "ISO-8601",
 *    errors:    [...]                 // field-level details (validation only)
 *  }
 *
 * SECURITY: stack traces are NEVER included in production responses.
 */
export const errorHandler = (err, req, res, _next) => {
  let error = err;

  // ── Mongoose: invalid ObjectId ───────────────────────────────────────────
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: '${err.value}' is not a valid ID.`, [], 'BAD_REQUEST');
  }

  // ── Mongoose: duplicate key ──────────────────────────────────────────────
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `A record with this ${field} already exists.`, [], 'CONFLICT');
  }

  // ── Mongoose: validation error ───────────────────────────────────────────
  else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(400, 'Validation failed.', messages, 'VALIDATION_ERROR');
  }

  // ── MongoDB: network / timeout errors ────────────────────────────────────
  else if (
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoTimeoutError'
  ) {
    logger.error('Database connectivity error', {
      event: 'DB_ERROR',
      errorName: err.name,
      errorCode: err.code,
      message: err.message,
      requestId: req.requestId,
    });
    error = new ApiError(503, 'Database temporarily unavailable. Please try again shortly.', [], 'DB_UNAVAILABLE');
  }

  // ── JWT errors ───────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token.', [], 'INVALID_TOKEN');
  }
  else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Your session has expired. Please log in again.', [], 'TOKEN_EXPIRED');
  }

  // ── CORS error ───────────────────────────────────────────────────────────
  else if (err.message?.startsWith('CORS:')) {
    error = new ApiError(403, 'Cross-origin request blocked.', [], 'CORS_BLOCKED');
  }

  // ── Unknown / programmer errors ──────────────────────────────────────────
  if (!error.isOperational) {
    logger.error('Unhandled internal error', {
      event: 'INTERNAL_ERROR',
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?._id?.toString(),
      errorName: err.name,
      message: err.message,
      // Stack included in logs only — never sent to client
      stack: err.stack,
    });
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || ApiError.codeFromStatus(statusCode);
  const message = error.isOperational ? error.message : 'An unexpected error occurred.';

  const isProduction = process.env.NODE_ENV === 'production';

  const responseBody = {
    success: false,
    code,
    status: statusCode,
    message,
    requestId: req.requestId || null,
    timestamp: new Date().toISOString(),
    ...(error.errors?.length > 0 && { errors: error.errors }),
    // Stack ONLY in development, ONLY for non-operational errors
    ...(!isProduction && !error.isOperational && { stack: err.stack }),
  };

  res.status(statusCode).json(responseBody);
};

/**
 * 404 handler — must be registered after all routes.
 */
export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.requestId || null,
    timestamp: new Date().toISOString(),
  });
};

