import { describe, it, expect, jest } from '@jest/globals';
import { ApiError } from '../../src/utils/ApiError.js';
import { ApiResponse } from '../../src/utils/ApiResponse.js';
import { asyncHandler } from '../../src/utils/asyncHandler.js';

describe('ApiError', () => {
  it('creates an operational error with correct properties', () => {
    const error = new ApiError(400, 'Bad request');

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.isOperational).toBe(true);
    expect(error.errors).toEqual([]);
  });

  it('includes field-level errors', () => {
    const fieldErrors = [{ field: 'email', message: 'Invalid email' }];
    const error = new ApiError(422, 'Validation failed', fieldErrors);

    expect(error.errors).toEqual(fieldErrors);
  });
});

describe('ApiResponse', () => {
  it('creates a success response with correct shape', () => {
    const response = new ApiResponse(200, 'OK', { id: 1 });

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.message).toBe('OK');
    expect(response.data).toEqual({ id: 1 });
  });

  it('includes pagination when provided', () => {
    const pagination = { page: 1, limit: 10, total: 100, pages: 10 };
    const response = new ApiResponse(200, 'OK', [], pagination);

    expect(response.pagination).toEqual(pagination);
  });

  it('omits pagination when not provided', () => {
    const response = new ApiResponse(200, 'OK', null);

    expect(response).not.toHaveProperty('pagination');
  });
});

describe('asyncHandler', () => {
  it('calls next with error when async function throws', async () => {
    const error = new ApiError(500, 'Test error');
    const fn = asyncHandler(async () => {
      throw error;
    });

    const next = jest.fn();
    await fn({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next when async function resolves', async () => {
    const fn = asyncHandler(async (_req, res) => {
      res.json({ ok: true });
    });

    const res = { json: jest.fn() };
    const next = jest.fn();
    await fn({}, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
