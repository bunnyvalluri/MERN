import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { AuthService } from '../../src/services/auth.service.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Authentication & Authorization Integration Tests', () => {
  const mockStudentId = new mongoose.Types.ObjectId().toString();
  const mockRecruiterId = new mongoose.Types.ObjectId().toString();

  const testStudent = {
    name: 'Emily Davis',
    email: 'emily.davis@stanford.edu',
    password: 'SecurePassword123!',
    role: USER_ROLES.STUDENT,
  };

  const testRecruiter = {
    name: 'Robert Vance',
    email: 'robert.vance@company.com',
    password: 'RecruiterPassword456!',
    role: USER_ROLES.RECRUITER,
  };

  const studentToken = generateAccessToken({
    id: mockStudentId,
    role: USER_ROLES.STUDENT,
    email: testStudent.email,
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('successfully registers a STUDENT account and returns 201 + tokens', async () => {
      jest.spyOn(AuthService, 'registerUser').mockResolvedValue({
        user: {
          _id: mockStudentId,
          name: testStudent.name,
          email: testStudent.email,
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: false,
        },
        accessToken: 'mock_jwt_access_token_123',
        refreshToken: 'mock_jwt_refresh_token_456',
        verificationToken: 'mock_verification_token_789',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testStudent.email);
      expect(res.body.data.user.role).toBe(USER_ROLES.STUDENT);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects public attempts to register an ADMIN or SUPER_ADMIN account with 400 Validation Error', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker User',
          email: 'admin_hacker@test.com',
          password: 'SecretPassword123!',
          role: 'ADMIN',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/Public registration is only permitted/);
    });

    it('rejects weak passwords failing complexity requirements with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Weak User',
          email: 'weak@test.com',
          password: 'password', // Missing uppercase, number, special character
          role: 'STUDENT',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/Password must be at least 8 characters/);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('authenticates valid credentials and returns 200 + tokens', async () => {
      jest.spyOn(AuthService, 'loginUser').mockResolvedValue({
        user: {
          _id: mockStudentId,
          name: testStudent.name,
          email: testStudent.email,
          role: USER_ROLES.STUDENT,
        },
        accessToken: 'valid_access_token_xyz',
        refreshToken: 'valid_refresh_token_abc',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('valid_access_token_xyz');
      expect(res.body.data.user.email).toBe(testStudent.email);
    });

    it('returns 400 if email or password are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'incomplete@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('successfully verifies email with valid token', async () => {
      jest.spyOn(AuthService, 'verifyEmail').mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: 'sample_valid_verification_token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing token with 400 Bad Request', async () => {
      const res = await request(app).post('/api/v1/auth/verify-email').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me (Protected Route)', () => {
    it('returns current user profile when valid Bearer token is provided', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: testStudent.name,
          email: testStudent.email,
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({
        user: {
          _id: mockStudentId,
          name: testStudent.name,
          email: testStudent.email,
          role: USER_ROLES.STUDENT,
        },
        profile: {
          headline: 'Computer Science Sophomore',
          skills: ['React', 'Node.js'],
        },
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testStudent.email);
    });

    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects tampered Bearer tokens with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer forged_tampered_token_123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('successfully returns rotated access token', async () => {
      jest.spyOn(AuthService, 'refreshSession').mockResolvedValue({
        accessToken: 'new_rotated_access_token_123',
        refreshToken: 'new_rotated_refresh_token_456',
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'active_valid_refresh_token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('new_rotated_access_token_123');
    });
  });

  describe('POST /api/v1/auth/forgot-password & reset-password', () => {
    it('handles forgot password request with generic confirmation message', async () => {
      jest.spyOn(AuthService, 'forgotPassword').mockResolvedValue({
        message: 'If an account exists, instructions have been sent.',
        resetToken: 'mock_reset_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testStudent.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('executes password reset with valid reset token and strong new password', async () => {
      jest.spyOn(AuthService, 'resetPassword').mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'valid_reset_token_123',
          newPassword: 'BrandNewStrongPassword999!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('clears session and returns 200 OK', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: testStudent.name,
          email: testStudent.email,
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(AuthService, 'logoutUser').mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
