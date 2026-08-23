/**
 * Client-side API Error Utilities
 *
 * Provides structured, consistent error extraction from Axios errors.
 * The server now returns a standardized shape:
 *   { success, code, status, message, requestId, timestamp, errors[] }
 *
 * SECURITY: Never expose stack traces or raw error objects to the UI.
 */

/**
 * @typedef {Object} ParsedApiError
 * @property {string}   code       - Machine-readable error code (e.g. 'VALIDATION_ERROR')
 * @property {string}   message    - Human-readable message safe to display
 * @property {number}   status     - HTTP status code (0 = network error)
 * @property {string|null} requestId - Server request ID for support tickets
 * @property {Array}    errors     - Field-level validation errors
 * @property {boolean}  isNetwork  - True if the error was a network/offline failure
 * @property {boolean}  isRetryable - True if the request should be retried
 */

/**
 * Map of server error codes to user-friendly UI messages.
 * Keeps message strings out of individual components and centralizes copy.
 */
const USER_FRIENDLY_MESSAGES = {
  UNAUTHORIZED: 'Please log in to continue.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_TOKEN: 'Authentication failed. Please log in again.',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact support.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',
  NOT_FOUND: 'The requested resource could not be found.',
  CONFLICT: 'This record already exists.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  DB_UNAVAILABLE: 'We\'re experiencing a temporary issue. Please try again in a moment.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again shortly.',
  GATEWAY_TIMEOUT: 'The server took too long to respond. Please try again.',
  INTERNAL_ERROR: 'Something went wrong on our end. We\'ve been notified.',
  CORS_BLOCKED: 'Connection blocked. Please try again.',
  // Network-level (no server response)
  NETWORK_ERROR: 'Unable to connect. Check your internet connection.',
  TIMEOUT: 'Request timed out. Check your connection and try again.',
};

/**
 * Extracts a structured error object from any Axios error.
 *
 * @param {import('axios').AxiosError} axiosError
 * @returns {ParsedApiError}
 */
export function parseApiError(axiosError) {
  // ── Network / offline error (no response from server) ────────────────────
  if (!axiosError.response) {
    const isTimeout = axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout');
    const code = isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR';
    return {
      code,
      message: USER_FRIENDLY_MESSAGES[code],
      status: 0,
      requestId: null,
      errors: [],
      isNetwork: true,
      isRetryable: true,
    };
  }

  // ── Server responded with an error ───────────────────────────────────────
  const { status, data } = axiosError.response;

  // Server error shape: { success, code, status, message, requestId, errors }
  const code = data?.code || deriveCode(status);
  const message =
    USER_FRIENDLY_MESSAGES[code] ||
    data?.message ||
    'An unexpected error occurred.';

  return {
    code,
    message,
    status,
    requestId: data?.requestId || null,
    errors: Array.isArray(data?.errors) ? data.errors : [],
    isNetwork: false,
    isRetryable: isRetryableStatus(status),
  };
}

/**
 * Returns true if the error appears to be a network/offline failure.
 * @param {Error} error
 * @returns {boolean}
 */
export function isNetworkError(error) {
  return Boolean(
    !error?.response && (
      error?.message === 'Network Error' ||
      error?.code === 'ERR_NETWORK' ||
      error?.code === 'ECONNABORTED' ||
      error?.message?.includes('timeout')
    )
  );
}

/**
 * Returns true if a request with this error should be automatically retried.
 * Used by the Axios interceptor and individual service calls.
 * @param {Error} error
 * @returns {boolean}
 */
export function isRetryable(error) {
  if (isNetworkError(error)) return true;
  const status = error?.response?.status;
  return isRetryableStatus(status);
}

/**
 * Returns a user-friendly message for a given server error code.
 * Falls back to a generic message if code is not in the map.
 * @param {string} code
 * @returns {string}
 */
export function getUserFriendlyMessage(code) {
  return USER_FRIENDLY_MESSAGES[code] || 'An unexpected error occurred.';
}

// ── Helpers ────────────────────────────────────────────────────────────────

function deriveCode(status) {
  const map = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
  };
  return map[status] || 'UNKNOWN_ERROR';
}

function isRetryableStatus(status) {
  return status === 429 || status === 503 || status === 504;
}
