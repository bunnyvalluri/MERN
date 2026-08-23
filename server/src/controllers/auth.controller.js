import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
  const result = await AuthService.loginUser({ email, password });

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
  await AuthService.verifyEmail(token);

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
