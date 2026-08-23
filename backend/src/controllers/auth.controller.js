import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

// Cookie options for secure HttpOnly session refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await AuthService.registerUser({ name, email, password, role });

  logger.info('User registered', {
    event: 'REGISTER_SUCCESS',
    userId: result.user._id?.toString(),
    email: result.user.email,
    role: result.user.role,
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json(
    new ApiResponse(201, 'Registration successful. Please verify your email.', {
      user: result.user,
      accessToken: result.accessToken,
      verificationToken: result.verificationToken,
    })
  );
});

/**
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let result;
  try {
    result = await AuthService.loginUser({ email, password });
  } catch (err) {
    // Audit log before re-throwing so failed logins are always recorded
    logger.warn('Login failed', {
      event: 'LOGIN_FAILURE',
      email,                           // email is not sensitive (it's a username)
      reason: err.message,
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    throw err;
  }

  logger.info('User logged in', {
    event: 'LOGIN_SUCCESS',
    userId: result.user._id?.toString(),
    email: result.user.email,
    role: result.user.role,
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json(
    new ApiResponse(200, 'Authentication successful.', {
      user: result.user,
      accessToken: result.accessToken,
    })
  );
});

/**
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  await AuthService.logoutUser(userId);

  logger.info('User logged out', {
    event: 'LOGOUT',
    userId: userId?.toString(),
    requestId: req.requestId,
    ip: req.ip,
  });

  res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });

  res.status(200).json(new ApiResponse(200, 'Logged out successfully.'));
});

/**
 * POST /api/v1/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await AuthService.refreshSession(incomingRefreshToken);

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json(
    new ApiResponse(200, 'Session refreshed successfully.', {
      accessToken: result.accessToken,
    })
  );
});

/**
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  logger.info('Password reset requested', {
    event: 'PASSWORD_RESET_REQUESTED',
    email,
    requestId: req.requestId,
    ip: req.ip,
  });

  res.status(200).json(new ApiResponse(200, result.message, { resetToken: result.resetToken }));
});

/**
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await AuthService.resetPassword({ token, newPassword });

  res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });

  res.status(200).json(
    new ApiResponse(200, 'Password has been reset successfully. Please log in with your new password.')
  );
});

/**
 * POST /api/v1/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await AuthService.verifyEmail(token);

  logger.info('Email verified', {
    event: 'EMAIL_VERIFIED',
    userId: result?.userId?.toString(),
    requestId: req.requestId,
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, 'Email address has been verified successfully.')
  );
});

/**
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const result = await AuthService.getCurrentUser(req.user._id);

  res.status(200).json(
    new ApiResponse(200, 'Current user profile fetched successfully.', result)
  );
});

export default {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
};
