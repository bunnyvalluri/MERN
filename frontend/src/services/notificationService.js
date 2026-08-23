import apiClient from '../lib/axios.js';

export const notificationService = {
  /**
   * Retrieves paginated notifications with optional filter.
   */
  getUserNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  /**
   * Fast unread count for badges.
   */
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Marks a single notification as read.
   */
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Marks all notifications as read.
   */
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Deletes a specific notification.
   */
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Clears all read notifications.
   */
  clearReadNotifications: async () => {
    const response = await apiClient.delete('/notifications/clear-read');
    return response.data;
  },
};

export default notificationService;
