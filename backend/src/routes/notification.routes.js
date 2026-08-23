import { Router } from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getNotificationsQuerySchema } from '../validators/notification.validator.js';

const router = Router();

// All notification routes require authenticated session
router.use(authenticateUser);

// ─── Notification Routes ─────────────────────────────────────────────────────
router.get('/', validate(getNotificationsQuerySchema, 'query'), getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/clear-read', clearReadNotifications);
router.delete('/:id', deleteNotification);

export default router;
