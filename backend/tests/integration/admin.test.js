import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { AdminService } from '../../src/services/admin.service.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import { INTERNSHIP_STATUS } from '../../src/models/Internship.model.js';

describe('Admin Dashboard Integration Tests', () => {
  const adminId = new mongoose.Types.ObjectId().toString();
  const studentId = new mongoose.Types.ObjectId().toString();
  const targetUserId = new mongoose.Types.ObjectId().toString();
  const targetCompanyId = new mongoose.Types.ObjectId().toString();
  const targetInternshipId = new mongoose.Types.ObjectId().toString();

  let adminToken;
  let studentToken;

  beforeAll(() => {
    adminToken = generateAccessToken({
      id: adminId,
      role: USER_ROLES.ADMIN,
    });

    studentToken = generateAccessToken({
      id: studentId,
      role: USER_ROLES.STUDENT,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/admin/metrics', () => {
    it('returns platform dashboard metrics for authenticated admin (200)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: adminId,
          role: USER_ROLES.ADMIN,
          isActive: true,
        }),
      });

      jest.spyOn(AdminService, 'getDashboardMetrics').mockResolvedValue({
        metrics: {
          totalUsers: 150,
          activeUsers: 140,
          studentsCount: 100,
          recruitersCount: 40,
          companiesCount: 25,
          internshipsCount: 50,
          applicationsCount: 200,
          pendingApprovals: 5,
        },
        charts: {
          userGrowth: [{ label: 'Aug 26', count: 20 }],
          statusDistribution: [],
        },
        recentLogs: [],
      });

      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.totalUsers).toBe(150);
      expect(res.body.data.metrics.pendingApprovals).toBe(5);
    });

    it('rejects student request with 403 Forbidden', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/users & PATCH status', () => {
    it('lists users with pagination and search', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: adminId,
          role: USER_ROLES.ADMIN,
          isActive: true,
        }),
      });

      jest.spyOn(AdminService, 'getUsers').mockResolvedValue({
        data: [
          { _id: targetUserId, name: 'Alice Student', email: 'alice@test.com', role: USER_ROLES.STUDENT, isActive: true },
        ],
        page: 1,
        limit: 15,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/admin/users?role=STUDENT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
    });

    it('activates / deactivates a user (200)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: adminId,
          role: USER_ROLES.ADMIN,
          isActive: true,
        }),
      });

      jest.spyOn(AdminService, 'updateUserStatus').mockResolvedValue({
        success: true,
        message: 'User was successfully deactivated.',
        user: { _id: targetUserId, isActive: false },
      });

      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Company & Internship Moderation', () => {
    it('verifies a company (200)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: adminId,
          role: USER_ROLES.ADMIN,
          isActive: true,
        }),
      });

      jest.spyOn(AdminService, 'verifyCompany').mockResolvedValue({
        success: true,
        message: 'Company verification status updated to Verified.',
        company: { _id: targetCompanyId, verified: true },
      });

      const res = await request(app)
        .patch(`/api/v1/admin/companies/${targetCompanyId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('moderates internship status (200)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: adminId,
          role: USER_ROLES.ADMIN,
          isActive: true,
        }),
      });

      jest.spyOn(AdminService, 'updateInternshipStatus').mockResolvedValue({
        success: true,
        message: 'Internship status updated to PUBLISHED.',
        internship: { _id: targetInternshipId, status: INTERNSHIP_STATUS.PUBLISHED },
      });

      const res = await request(app)
        .patch(`/api/v1/admin/internships/${targetInternshipId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PUBLISHED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/audit-logs & Broadcast', () => {
    it('retrieves paginated audit logs', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: adminId,
          role: USER_ROLES.ADMIN,
          isActive: true,
        }),
      });

      jest.spyOn(AdminService, 'getAuditLogs').mockResolvedValue({
        data: [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            action: 'USER_DEACTIVATED',
            resource: 'User',
            createdAt: new Date().toISOString(),
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
    });

    it('sends system broadcast notification (200)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: adminId,
          role: USER_ROLES.ADMIN,
          isActive: true,
        }),
      });

      jest.spyOn(AdminService, 'broadcastNotification').mockResolvedValue({
        success: true,
        message: 'Broadcast delivered to 150 user(s).',
        recipientCount: 150,
      });

      const res = await request(app)
        .post('/api/v1/admin/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targetRole: 'ALL',
          title: 'Scheduled Maintenance',
          message: 'System maintenance on Sunday.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
