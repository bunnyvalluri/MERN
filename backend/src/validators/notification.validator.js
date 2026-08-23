import Joi from 'joi';
import { NOTIFICATION_TYPES } from '../models/Notification.model.js';

/**
 * Validation schema for querying user notifications.
 */
export const getNotificationsQuerySchema = Joi.object({
  unreadOnly: Joi.string().valid('true', 'false').optional(),
  type: Joi.string()
    .valid('ALL', ...Object.values(NOTIFICATION_TYPES))
    .default('ALL'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(15),
});
