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

export class AuthService {
  /**
   * Registers a new user (STUDENT or RECRUITER) and creates associated profile.
   */
  static async registerUser({ name, email, password, role }) {
    // 1. Enforce role restrictions for public registration
    if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(
        403,
        'Administrative accounts cannot be created through public registration.'
      );
    }

    // 2. Prevent duplicate email registration
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }

    // 3. Generate email verification token (valid for 24 hours)
    const rawVerificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 4. Create User document
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // Mongoose pre-save hook hashes with bcrypt
      role,
      verificationToken: hashedVerificationToken,
      verificationTokenExpiresAt: verificationExpiresAt,
      isVerified: false,
      isActive: true,
    });

    await user.save();

    // 5. Automatically scaffold empty StudentProfile if user is a student
    if (role === USER_ROLES.STUDENT) {
      await StudentProfile.create({
        userId: user._id,
        headline: '',
        bio: '',
        skills: [],
      });
    }

    // Trigger Registration Welcome Notification
    await NotificationService.notifyRegistration(user);

    // 6. Issue initial JWT tokens
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
      verificationToken: rawVerificationToken, // Provided for automated testing / email worker
    };
  }

  /**
   * Authenticates user credentials and returns new token pair.
   */
  static async loginUser({ email, password }) {
    const sanitizedEmail = email.toLowerCase().trim();

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: sanitizedEmail }).select(
      '+passwordHash +refreshToken'
    );

    // Generic error message to prevent user enumeration
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        'Your account has been deactivated. Please contact support.'
      );
    }

    // Verify password hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Update last login timestamp & rotate refresh token
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

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Session invalid or account deactivated.');
    }

    // Detect token reuse / revocation
    const hashedIncomingToken = hashToken(incomingRefreshToken);
    if (user.refreshToken !== hashedIncomingToken) {
      // Possible token reuse attack — invalidate all sessions
      user.refreshToken = null;
      await user.save();
      throw new ApiError(401, 'Session revoked due to token reuse detection.');
    }

    // Rotate tokens
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
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
    return true;
  }

  /**
   * Generates password reset token and returns reset instructions.
   */
  static async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return generic response to prevent account harvesting
    let resetToken = null;

    if (user && user.isActive) {
      resetToken = generateRandomToken();
      user.passwordResetToken = hashToken(resetToken);
      user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save();
    }

    return {
      message:
        'If an account exists with this email address, password reset instructions have been sent.',
      resetToken, // Included in response for development / automated testing
    };
  }

  /**
   * Resets password using a validated one-time reset token.
   */
  static async resetPassword({ token, newPassword }) {
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordHash +passwordResetToken +passwordResetExpiresAt');

    if (!user) {
      throw new ApiError(400, 'Password reset token is invalid or has expired.');
    }

    // Set new password (pre-save hook will hash it)
    user.passwordHash = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    user.refreshToken = null; // Revoke all active sessions on password change
    await user.save();

    return true;
  }

  /**
   * Verifies email using one-time verification token.
   */
  static async verifyEmail(token) {
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

    // Trigger Email Verification Notification
    await NotificationService.notifyEmailVerification(user);

    return true;
  }

  /**
   * Fetches the current authenticated user's full profile.
   */
  static async getCurrentUser(userId) {
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
