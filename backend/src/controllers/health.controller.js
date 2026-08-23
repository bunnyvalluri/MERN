import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDBStatus } from '../config/db.js';

/**
 * GET /api/v1/health
 *
 * Comprehensive liveness & readiness health check probe.
 * Reports server uptime, process memory, environment, and live MongoDB connection state with ping latency.
 */
export const healthCheck = asyncHandler(async (_req, res) => {
  const dbStatus = await getDBStatus();

  const isHealthy = dbStatus.isConnected || process.env.NODE_ENV !== 'production';
  const statusCode = isHealthy ? 200 : 503;

  const healthData = {
    service: 'InternHub REST API',
    status: isHealthy ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  };

  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      isHealthy ? 'InternHub API is running' : 'Service degraded (database unavailable)',
      healthData
    )
  );
});

export default healthCheck;
