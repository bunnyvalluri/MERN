import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { NotificationService } from '../../src/services/notification.service.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import { NOTIFICATION_TYPES } from '../../src/models/Notification.model.js';

describe('Centralized Notification System Integration Tests', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockNotificationId = new mongoose.Types.ObjectId().toString();
  let userToken;

  beforeAll(() => {
    userToken = generateAccessToken({
      id: mockUserId,
      role: USER_ROLES.STUDENT,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/notifications/unread-count', () => {
    it('returns fast unread count for user badge', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(NotificationService, 'getUnreadCount').mockResolvedValue({
        unreadCount: 4,
      });

      const res = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unreadCount).toBe(4);
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('returns paginated notifications list for user', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(NotificationService, 'getUserNotifications').mockResolvedValue({
        data: [
          {
            _id: mockNotificationId,
            userId: mockUserId,
            type: NOTIFICATION_TYPES.REGISTRATION_WELCOME,
            title: 'Welcome to InternHub! 🚀',
            message: 'Welcome aboard!',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
        page: 1,
        limit: 15,
        total: 1,
        totalPages: 1,
        unreadCount: 1,
      });

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.unreadCount).toBe(1);
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('marks a single notification as read', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(NotificationService, 'markAsRead').mockResolvedValue({
        _id: mockNotificationId,
        read: true,
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${mockNotificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.read).toBe(true);
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    it('marks all user notifications as read', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(NotificationService, 'markAllAsRead').mockResolvedValue({
        success: true,
        message: 'All notifications marked as read.',
      });

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    it('deletes a notification', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(NotificationService, 'deleteNotification').mockResolvedValue({
        success: true,
        message: 'Notification deleted successfully.',
      });

      const res = await request(app)
        .delete(`/api/v1/notifications/${mockNotificationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
