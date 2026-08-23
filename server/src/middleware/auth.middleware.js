import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.utils.js';
import { User } from '../models/User.model.js';

export * from './authorization.middleware.js';

/**
 * Middleware to authenticate requests using JWT Access Tokens.
 * Expects header: Authorization: Bearer <token>
 */
export const authenticateUser = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new ApiError(401, 'Authentication required. Please provide a valid Bearer token.')
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new ApiError(401, 'Authentication token missing.'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Access token has expired. Please refresh your session.'));
      }
      return next(new ApiError(401, 'Invalid authentication token.'));
    }

    const user = await User.findById(decoded.id).select(
      '_id name email role avatar isActive isVerified'
    );

    if (!user) {
      return next(new ApiError(401, 'User account no longer exists.'));
    }

    if (!user.isActive) {
      return next(
        new ApiError(403, 'Account is deactivated. Please contact platform administrators.')
      );
    }

    // Attach authenticated user to request context
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticateUser;
