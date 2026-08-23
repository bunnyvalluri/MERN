import Joi from 'joi';

// Strong password regex: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_ERROR_MSG =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).';

/**
 * Validation schema for public user registration.
 * Explicitly limits roles to STUDENT and RECRUITER.
 */
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().min(8).max(128).pattern(PASSWORD_PATTERN).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': PASSWORD_ERROR_MSG,
  }),
  role: Joi.string()
    .valid('STUDENT', 'RECRUITER')
    .required()
    .messages({
      'any.only': 'Public registration is only permitted for STUDENT or RECRUITER accounts.',
      'string.empty': 'Role is required',
    }),
});

/**
 * Validation schema for user login.
 */
export const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

/**
 * Validation schema for forgot password request.
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
});

/**
 * Validation schema for password reset execution.
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    'string.empty': 'Reset token is required',
  }),
  newPassword: Joi.string().min(8).max(128).pattern(PASSWORD_PATTERN).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 8 characters long',
    'string.pattern.base': PASSWORD_ERROR_MSG,
  }),
});

/**
 * Validation schema for email verification.
 */
export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    'string.empty': 'Verification token is required',
  }),
});
