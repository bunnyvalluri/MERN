/**
 * Custom operational error class.
 *
 * Distinguishes known, anticipated errors (e.g. 404 Not Found, 400 Bad Request)
 * from unexpected programmer errors. The global error handler uses `isOperational`
 * to decide whether to send a safe message to the client or log a critical alert.
 *
 * Every ApiError carries a machine-readable `code` string (SCREAMING_SNAKE_CASE)
 * that the frontend and monitoring systems use to classify errors without parsing
 * human-readable messages.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode  - HTTP status code
   * @param {string} message     - Human-readable error message
   * @param {Array}  errors      - Optional field-level validation error array
   * @param {string} [code]      - Machine-readable error code (default derived from statusCode)
   * @param {string} [stack]     - Optional stack trace (auto-captured if omitted)
   */
  constructor(statusCode, message, errors = [], code = null, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    this.code = code || ApiError.codeFromStatus(statusCode);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Derives a default error code from an HTTP status code.
   * @param {number} status
   * @returns {string}
   */
  static codeFromStatus(status) {
    const map = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };
    return map[status] || 'UNKNOWN_ERROR';
  }

  // ── Static factory helpers ────────────────────────────────────────────────

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors, 'BAD_REQUEST');
  }

  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, message, [], 'UNAUTHORIZED');
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message, [], 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found.`, [], 'NOT_FOUND');
  }

  static conflict(message) {
    return new ApiError(409, message, [], 'CONFLICT');
  }

  static validationError(errors = []) {
    return new ApiError(400, 'Validation failed.', errors, 'VALIDATION_ERROR');
  }

  static rateLimited() {
    return new ApiError(429, 'Too many requests. Please slow down.', [], 'RATE_LIMITED');
  }

  static serviceUnavailable(message = 'Service temporarily unavailable.') {
    return new ApiError(503, message, [], 'SERVICE_UNAVAILABLE');
  }

  static internal(message = 'An unexpected error occurred.') {
    return new ApiError(500, message, [], 'INTERNAL_ERROR');
  }
}
