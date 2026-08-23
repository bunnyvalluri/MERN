import { logger } from '../utils/logger.js';

/**
 * Structured HTTP Request Logger Middleware.
 *
 * Replaces raw morgan with a structured JSON log per request, capturing:
 * - requestId (from requestIdMiddleware)
 * - HTTP method, URL, status code, response time
 * - Authenticated userId (if available)
 * - Client IP and User-Agent
 *
 * Security guarantees:
 * - NEVER logs request body (avoids password/token leakage)
 * - NEVER logs Authorization / Cookie headers
 * - Skips health check endpoint in production to reduce noise
 *
 * Must be registered AFTER requestIdMiddleware in app.js.
 */
export const httpLoggerMiddleware = (req, res, next) => {
  const startAt = process.hrtime.bigint();

  // Log when the response finishes (captures final status code & size)
  res.on('finish', () => {
    // Skip health checks in production to keep logs clean
    if (process.env.NODE_ENV === 'production' && req.path === '/api/v1/health') {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startAt) / 1_000_000;

    const logPayload = {
      event: 'HTTP_REQUEST',
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(durationMs * 100) / 100,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'] || 'unknown',
      // Attach userId if the request was authenticated
      ...(req.user?._id && { userId: req.user._id.toString() }),
      ...(req.user?.role && { userRole: req.user.role }),
    };

    // Route to appropriate log level based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP request completed with server error', logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP request completed with client error', logPayload);
    } else {
      logger.info('HTTP request completed', logPayload);
    }
  });

  next();
};

export default httpLoggerMiddleware;
