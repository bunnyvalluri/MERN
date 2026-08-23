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

export const DEMO_ACCOUNTS = {
  'student@internhub.dev': {
    _id: '64b1f2a3c9e77a0012345671',
    name: 'Jordan Lee',
    email: 'student@internhub.dev',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  'jordan.lee@stanford.edu': {
    _id: '64b1f2a3c9e77a0012345671',
    name: 'Jordan Lee',
    email: 'jordan.lee@stanford.edu',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  'recruiter@stripe.com': {
    _id: '64b1f2a3c9e77a0012345672',
    name: 'Sarah Jenkins',
    email: 'recruiter@stripe.com',
    role: 'RECRUITER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    company: 'comp_stripe_01',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  'sarah.jenkins@stripe.com': {
    _id: '64b1f2a3c9e77a0012345672',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@stripe.com',
    role: 'RECRUITER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    company: 'comp_stripe_01',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  'admin@internhub.dev': {
    _id: '64b1f2a3c9e77a0012345673',
    name: 'Alex Vance (Platform Admin)',
    email: 'admin@internhub.dev',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-08-01T10:00:00.000Z',
  },
};

export class AuthService {
  /**
   * Registers a new user (STUDENT or RECRUITER) and creates associated profile.
   */
  static async registerUser({ name, email, password, role }) {
    if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(
        403,
        'Administrative accounts cannot be created through public registration.'
      );
    }

    if (mongoose.connection.readyState !== 1) {
      const mockId = `usr_${Date.now()}`;
      const newUser = {
        _id: mockId,
        id: mockId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role || USER_ROLES.STUDENT,
        isVerified: true,
        isActive: true,
      };
      const accessToken = generateAccessToken({
        id: newUser._id,
        role: newUser.role,
        email: newUser.email,
      });
      const rawRefreshToken = generateRefreshToken({ id: newUser._id });
      return {
        user: newUser,
        accessToken,
        refreshToken: rawRefreshToken,
        verificationToken: 'demo_verification_token',
      };
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
   * Authenticates user credentials and returns new token pair.
   */
  static async loginUser({ email, password }) {
    const sanitizedEmail = email.toLowerCase().trim();

    // 1. Check Demo Accounts for instant, frictionless login testing
    if (DEMO_ACCOUNTS[sanitizedEmail]) {
      const demoUser = DEMO_ACCOUNTS[sanitizedEmail];
      const accessToken = generateAccessToken({
        id: demoUser._id,
        role: demoUser.role,
        email: demoUser.email,
      });
      const rawRefreshToken = generateRefreshToken({ id: demoUser._id });
      return {
        user: demoUser,
        accessToken,
        refreshToken: rawRefreshToken,
      };
    }

    // 2. If MongoDB is not connected, check generic format
    if (mongoose.connection.readyState !== 1) {
      const role = sanitizedEmail.includes('admin')
        ? 'ADMIN'
        : sanitizedEmail.includes('recruiter') || sanitizedEmail.includes('hr')
        ? 'RECRUITER'
        : 'STUDENT';

      const fallbackUser = {
        _id: '64b1f2a3c9e77a0012345679',
        name: sanitizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: sanitizedEmail,
        role,
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const accessToken = generateAccessToken({
        id: fallbackUser._id,
        role: fallbackUser.role,
        email: fallbackUser.email,
      });
      const rawRefreshToken = generateRefreshToken({ id: fallbackUser._id });

      return {
        user: fallbackUser,
        accessToken,
        refreshToken: rawRefreshToken,
      };
    }

    // 3. Query Database
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

    if (mongoose.connection.readyState !== 1) {
      const demoAccount = Object.values(DEMO_ACCOUNTS).find((u) => u._id === decoded.id) || {
        _id: decoded.id,
        role: 'STUDENT',
        email: 'user@internhub.dev',
      };
      const newAccessToken = generateAccessToken({
        id: demoAccount._id,
        role: demoAccount.role,
        email: demoAccount.email,
      });
      const newRawRefreshToken = generateRefreshToken({ id: demoAccount._id });
      return {
        accessToken: newAccessToken,
        refreshToken: newRawRefreshToken,
      };
    }

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
    if (mongoose.connection.readyState !== 1) {
      return {
        message: 'If an account exists with this email address, password reset instructions have been sent.',
        resetToken: 'demo_password_reset_token',
      };
    }

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
    if (mongoose.connection.readyState !== 1) {
      return true;
    }

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
    if (mongoose.connection.readyState !== 1) {
      return true;
    }

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
    if (mongoose.connection.readyState !== 1) {
      const demoAccount = Object.values(DEMO_ACCOUNTS).find((u) => u._id === userId) || {
        _id: userId,
        name: 'Jordan Lee',
        email: 'student@internhub.dev',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        isActive: true,
      };
      return {
        user: demoAccount,
        profile: {
          headline: 'CS Junior at Stanford | Full-Stack & Distributed Systems',
          bio: 'Passionate computer science student with a strong foundation in modern web engineering.',
          skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
        },
      };
    }

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
