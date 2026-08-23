import { describe, it, expect } from 'vitest';
import {
  parseApiError,
  isNetworkError,
  isRetryable,
  getUserFriendlyMessage,
} from '../utils/apiError.js';

describe('apiError Utility', () => {
  it('should parse structured server API error responses', () => {
    const mockAxiosError = {
      response: {
        status: 400,
        data: {
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data provided.',
          requestId: 'test-uuid-1234',
          errors: [{ field: 'email', message: 'Email format invalid' }],
        },
      },
    };

    const parsed = parseApiError(mockAxiosError);
    expect(parsed.code).toBe('VALIDATION_ERROR');
    expect(parsed.status).toBe(400);
    expect(parsed.requestId).toBe('test-uuid-1234');
    expect(parsed.isNetwork).toBe(false);
    expect(parsed.isRetryable).toBe(false);
    expect(parsed.errors).toHaveLength(1);
  });

  it('should handle network connection drops cleanly', () => {
    const mockNetworkError = {
      message: 'Network Error',
      code: 'ERR_NETWORK',
    };

    expect(isNetworkError(mockNetworkError)).toBe(true);
    const parsed = parseApiError(mockNetworkError);
    expect(parsed.code).toBe('NETWORK_ERROR');
    expect(parsed.status).toBe(0);
    expect(parsed.isNetwork).toBe(true);
    expect(parsed.isRetryable).toBe(true);
  });

  it('should identify retryable HTTP status codes (429, 503, 504)', () => {
    expect(isRetryable({ response: { status: 429 } })).toBe(true);
    expect(isRetryable({ response: { status: 503 } })).toBe(true);
    expect(isRetryable({ response: { status: 504 } })).toBe(true);
    expect(isRetryable({ response: { status: 400 } })).toBe(false);
    expect(isRetryable({ response: { status: 401 } })).toBe(false);
    expect(isRetryable({ response: { status: 404 } })).toBe(false);
  });

  it('should provide localized user-friendly copy for known codes', () => {
    expect(getUserFriendlyMessage('UNAUTHORIZED')).toBe('Please log in to continue.');
    expect(getUserFriendlyMessage('TOKEN_EXPIRED')).toBe('Your session has expired. Please log in again.');
    expect(getUserFriendlyMessage('RATE_LIMITED')).toBe('Too many requests. Please wait a moment and try again.');
  });
});
