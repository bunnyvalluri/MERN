import { randomUUID } from 'crypto';

/**
 * Request ID Middleware.
 *
 * Generates a unique UUID v4 `X-Request-Id` for every incoming request
 * (or echoes one supplied by the client/load-balancer), attaches it to
 * `req.requestId`, and sets it on the response header so callers can
 * correlate client logs with server logs.
 *
 * MUST be the first middleware registered in app.js so the ID is available
 * to every subsequent middleware and error handler.
 *
 * Header: X-Request-Id
 * Format: UUID v4 (e.g. "550e8400-e29b-41d4-a716-446655440000")
 */
export const requestIdMiddleware = (req, res, next) => {
  // Honour client/load-balancer supplied IDs (common in AWS ALB, Cloudflare, Nginx)
  const existingId = req.headers['x-request-id'];
  const requestId = existingId && isValidUUID(existingId)
    ? existingId
    : randomUUID();

  req.requestId = requestId;

  // Echo back on every response for client-side correlation
  res.setHeader('X-Request-Id', requestId);

  next();
};

/**
 * Validates a UUID v4 string without external dependencies.
 * @param {string} str
 * @returns {boolean}
 */
function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export default requestIdMiddleware;
