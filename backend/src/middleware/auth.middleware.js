import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.utils.js';
import { User } from '../models/User.model.js';
import { logger } from '../utils/logger.js';
import { DEMO_ACCOUNTS } from '../services/auth.service.js';

export * from './authorization.middleware.js';

/**
 * Middleware to authenticate requests using JWT Access Tokens.
 * Expects header: Authorization: Bearer <token>
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
      // Demo token bypass for development
      if (token.startsWith('demo_')) {
        const role = token.includes('admin')
          ? 'ADMIN'
          : token.includes('recruiter')
          ? 'RECRUITER'
          : 'STUDENT';

        req.user = {
          _id: '64b1f2a3c9e77a0012345671',
          name: 'Jordan Lee',
          email: 'student@internhub.dev',
          role,
          isVerified: true,
          isActive: true,
        };
        return next();
      }

      logger.warn('Auth failure: invalid token signature', {
        event: 'AUTH_FAILURE',
        reason: 'invalid_token',
        ...logCtx,
      });
      return next(new ApiError(401, 'Invalid authentication token.', [], 'INVALID_TOKEN'));
    }

    // 1. Check Demo Accounts first for 0ms latency
    const demoUser = Object.values(DEMO_ACCOUNTS).find((u) => u._id === decoded.id || u.email === decoded.email);
    if (demoUser) {
      req.user = demoUser;
      return next();
    }

    // 2. If MongoDB is offline, use decoded token payload directly
    if (mongoose.connection.readyState !== 1) {
      req.user = {
        _id: decoded.id || '64b1f2a3c9e77a0012345671',
        name: decoded.name || 'Jordan Lee',
        email: decoded.email || 'student@internhub.dev',
        role: decoded.role || 'STUDENT',
        isVerified: true,
        isActive: true,
      };
      return next();
    }

    // 3. Query Database
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
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          const demoUser = Object.values(DEMO_ACCOUNTS).find((u) => u._id === decoded.id || u.email === decoded.email);
          if (demoUser) {
            req.user = demoUser;
            return next();
          }

          if (mongoose.connection.readyState === 1) {
            const user = await User.findById(decoded.id).select(
              '_id name email role avatar isActive isVerified'
            );
            if (user && user.isActive) {
              req.user = user;
            }
          } else {
            req.user = {
              _id: decoded.id,
              email: decoded.email,
              role: decoded.role,
              isActive: true,
              isVerified: true,
            };
          }
        } catch {
          // Continue anonymously
        }
      }
    }
    next();
  } catch {
    next();
  }
};

export default authenticateUser;
