import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_dev_access_secret_do_not_use_in_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_dev_refresh_secret_do_not_use_in_prod';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Signs a short-lived JWT Access Token.
 *
 * @param {object} payload - { id, role, email }
 * @returns {string} Signed JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

/**
 * Signs a long-lived JWT Refresh Token.
 *
 * @param {object} payload - { id }
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

/**
 * Verifies a JWT Access Token.
 *
 * @param {string} token
 * @returns {object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Verifies a JWT Refresh Token.
 *
 * @param {string} token
 * @returns {object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

/**
 * Generates a cryptographically secure random token (e.g. for email verification or password reset).
 *
 * @param {number} bytes - Number of random bytes
 * @returns {string} Hex encoded token string
 */
export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Computes SHA-256 hash of a token for secure database storage.
 *
 * @param {string} token - Raw token string
 * @returns {string} Hex encoded hash
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
