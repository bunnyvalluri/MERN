import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.utils.js';
import { User } from '../models/User.model.js';
import { logger } from '../utils/logger.js';

export * from './authorization.middleware.js';

/**
 * Middleware to authenticate requests using JWT Access Tokens.
 * Expects header: Authorization: Bearer <token>
 * All DEMO_ACCOUNTS and offline fallbacks removed — requires live Atlas connection.
 */
export const authenticateUser = async (req, _res, next) => {
  const logCtx = {
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    method: req.method,
    url: req.originalUrl,
  };

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Auth failure: missing or malformed token', {
        event: 'AUTH_FAILURE',
        reason: 'missing_token',
        ...logCtx,
      });
      return next(
        new ApiError(401, 'Authentication required. Please provide a valid Bearer token.', [], 'UNAUTHORIZED')
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Auth failure: empty token after Bearer prefix', {
        event: 'AUTH_FAILURE',
        reason: 'empty_token',
        ...logCtx,
      });
      return next(new ApiError(401, 'Authentication token missing.', [], 'UNAUTHORIZED'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warn('Auth failure: access token expired', {
          event: 'AUTH_FAILURE',
          reason: 'token_expired',
          ...logCtx,
        });
        return next(new ApiError(401, 'Access token has expired. Please refresh your session.', [], 'TOKEN_EXPIRED'));
      }

      logger.warn('Auth failure: invalid token signature', {
        event: 'AUTH_FAILURE',
        reason: 'invalid_token',
        ...logCtx,
      });
      return next(new ApiError(401, 'Invalid authentication token.', [], 'INVALID_TOKEN'));
    }

    // If MongoDB is offline, return 503 cleanly
    if (mongoose.connection.readyState !== 1) {
      return next(new ApiError(503, 'Database connection unavailable. Please try again shortly.'));
    }

    // Query Database for live user record
    const user = await User.findById(decoded.id).select(
      '_id name email role avatar isActive isVerified'
    );

    if (!user) {
      logger.warn('Auth failure: user no longer exists', {
        event: 'AUTH_FAILURE',
        reason: 'user_not_found',
        userId: decoded.id,
        ...logCtx,
      });
      return next(new ApiError(401, 'User account no longer exists.', [], 'UNAUTHORIZED'));
    }

    if (!user.isActive) {
      logger.warn('Auth failure: deactivated account', {
        event: 'AUTH_FAILURE',
        reason: 'account_deactivated',
        userId: user._id.toString(),
        email: user.email,
        ...logCtx,
      });
      return next(
        new ApiError(403, 'Account is deactivated. Please contact platform administrators.', [], 'ACCOUNT_DEACTIVATED')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware.
 * Silently attaches user to req if valid token is present. Never blocks the request.
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          if (mongoose.connection.readyState === 1) {
            const user = await User.findById(decoded.id).select(
              '_id name email role avatar isActive isVerified'
            );
            if (user && user.isActive) {
              req.user = user;
            }
          }
        } catch {
          // Continue anonymously — token invalid or expired
        }
      }
    }
    next();
  } catch {
    next();
  }
};

export default authenticateUser;
