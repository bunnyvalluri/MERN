import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/v1/notifications
 * Retrieves paginated notifications for the authenticated user.
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
  const result = await NotificationService.getUserNotifications(
    req.user._id,
    req.query
  );
  res.status(200).json(
    new ApiResponse(200, 'Notifications retrieved successfully.', result)
  );
});

/**
 * GET /api/v1/notifications/unread-count
 * Retrieves fast count of unread notifications for badge indicators.
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await NotificationService.getUnreadCount(req.user._id);
  res.status(200).json(
    new ApiResponse(200, 'Unread count retrieved.', result)
  );
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a specific notification as read.
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markAsRead(
    req.user._id,
    req.params.id
  );
  res.status(200).json(
    new ApiResponse(200, 'Notification marked as read.', notification)
  );
});

/**
 * PATCH /api/v1/notifications/read-all
 * Marks all notifications as read for current user.
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await NotificationService.markAllAsRead(req.user._id);
  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

/**
 * DELETE /api/v1/notifications/:id
 * Deletes a specific notification for current user.
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await NotificationService.deleteNotification(
    req.user._id,
    req.params.id
  );
  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

/**
 * DELETE /api/v1/notifications/clear-read
 * Clears all read notifications for current user.
 */
export const clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await NotificationService.clearReadNotifications(req.user._id);
  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

export default {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
};
