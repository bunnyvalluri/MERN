import mongoose from 'mongoose';
import { User, USER_ROLES } from '../models/User.model.js';
import { StudentProfile } from '../models/StudentProfile.model.js';
import { NotificationService } from './notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} from '../utils/token.utils.js';

/**
 * Guard — throws 503 if MongoDB is not connected.
 * All methods in this service require Atlas to be live.
 */
function requireDB() {
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
  }
}

export class AuthService {
  /**
   * Registers a new user (STUDENT or RECRUITER) and creates associated profile.
   */
  static async registerUser({ name, email, password, role }) {
    requireDB();

    if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(
        403,
        'Administrative accounts cannot be created through public registration.'
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }

    const rawVerificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role,
      verificationToken: hashedVerificationToken,
      verificationTokenExpiresAt: verificationExpiresAt,
      isVerified: false,
      isActive: true,
    });

    await user.save();

    if (role === USER_ROLES.STUDENT) {
      await StudentProfile.create({
        userId: user._id,
        headline: '',
        bio: '',
        skills: [],
      });
    }

    await NotificationService.notifyRegistration(user);

    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });

    const rawRefreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = hashToken(rawRefreshToken);
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken: rawRefreshToken,
      verificationToken: rawVerificationToken,
    };
  }

  /**
   * Authenticates user credentials against MongoDB Atlas and returns a new token pair.
   * All demo/offline fallbacks have been removed — real DB auth only.
   */
  static async loginUser({ email, password }) {
    requireDB();

    const sanitizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: sanitizedEmail }).select(
      '+passwordHash +refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        'Your account has been deactivated. Please contact support.'
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    user.lastLoginAt = new Date();

    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });

    const rawRefreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = hashToken(rawRefreshToken);
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Rotates refresh tokens and issues a fresh session access token.
   */
  static async refreshSession(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token missing. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new ApiError(401, 'Invalid or expired session. Please log in again.');
    }

    requireDB();

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Session invalid or account deactivated.');
    }

    const hashedIncomingToken = hashToken(incomingRefreshToken);
    if (user.refreshToken !== hashedIncomingToken) {
      user.refreshToken = null;
      await user.save();
      throw new ApiError(401, 'Session revoked due to token reuse detection.');
    }

    const newAccessToken = generateAccessToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });

    const newRawRefreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = hashToken(newRawRefreshToken);
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Invalidates active session on logout.
   */
  static async logoutUser(userId) {
    if (userId && mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
    return true;
  }

  /**
   * Generates password reset token and returns reset instructions.
   */
  static async forgotPassword(email) {
    requireDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    let resetToken = null;

    if (user && user.isActive) {
      resetToken = generateRandomToken();
      user.passwordResetToken = hashToken(resetToken);
      user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
    }

    return {
      message:
        'If an account exists with this email address, password reset instructions have been sent.',
      resetToken,
    };
  }

  /**
   * Resets password using a validated one-time reset token.
   */
  static async resetPassword({ token, newPassword }) {
    requireDB();

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordHash +passwordResetToken +passwordResetExpiresAt');

    if (!user) {
      throw new ApiError(400, 'Password reset token is invalid or has expired.');
    }

    user.passwordHash = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    user.refreshToken = null;
    await user.save();

    return true;
  }

  /**
   * Verifies email using one-time verification token.
   */
  static async verifyEmail(token) {
    requireDB();

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, 'Verification token is invalid or has expired.');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    await NotificationService.notifyEmailVerification(user);

    return true;
  }

  /**
   * Fetches the current authenticated user's full profile.
   */
  static async getCurrentUser(userId) {
    requireDB();

    const user = await User.findById(userId).select(
      '_id name email role avatar isActive isVerified lastLoginAt createdAt updatedAt'
    );

    if (!user) {
      throw new ApiError(404, 'User profile not found.');
    }

    let profile = null;
    if (user.role === USER_ROLES.STUDENT) {
      profile = await StudentProfile.findOne({ userId });
    }

    return {
      user,
      profile,
    };
  }
}

export default AuthService;
