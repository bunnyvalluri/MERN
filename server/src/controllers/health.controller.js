import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/v1/health
 *
 * Lightweight liveness probe. Used by deployment platforms and monitoring
 * tools to confirm the API process is running and reachable.
 */
export const healthCheck = asyncHandler((_req, res) => {
  res.status(200).json(
    new ApiResponse(200, 'InternHub API is running', {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    })
  );
});
