/**
 * Custom operational error class.
 *
 * Distinguishes known, anticipated errors (e.g. 404 Not Found, 400 Bad Request)
 * from unexpected programmer errors. The global error handler uses `isOperational`
 * to decide whether to send a safe message to the client or log a critical alert.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable error message
   * @param {Array}  errors     - Optional array of field-level validation errors
   * @param {string} stack      - Optional stack trace (auto-captured if omitted)
   */
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
