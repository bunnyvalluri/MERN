import mongoose from 'mongoose';
import { Notification, NOTIFICATION_TYPES } from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const DEMO_NOTIFICATIONS = [
  {
    _id: 'notif_demo_01',
    userId: '64b1f2a3c9e77a0012345671',
    type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED || 'INTERVIEW_SCHEDULED',
    title: 'Technical Screen Scheduled 📞',
    message: 'Stripe scheduled your Technical Screen for Software Engineering Intern — Core Payments on Friday, Aug 28 at 2:00 PM PST.',
    link: '/student/applications/app_demo_01',
    read: false,
    createdAt: '2026-08-20T11:00:00.000Z',
  },
  {
    _id: 'notif_demo_02',
    userId: '64b1f2a3c9e77a0012345671',
    type: NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED || 'APPLICATION_STATUS_UPDATED',
    title: 'Application Under Review 🔍',
    message: 'OpenAI research engineers have begun reviewing your application and technical portfolio.',
    link: '/student/applications/app_demo_02',
    read: true,
    createdAt: '2026-08-19T09:00:00.000Z',
  },
];

export class NotificationService {
  /**
   * Central core method to create and persist a notification document.
   */
  static async createNotification({
    userId,
    type = NOTIFICATION_TYPES.SYSTEM_ALERT,
    title,
    message,
    link = '',
    metadata = {},
  }) {
    try {
      if (!userId || !title || !message) {
        logger.warn('NotificationService: Missing required fields for notification');
        return null;
      }

      if (mongoose.connection.readyState !== 1) {
        const fakeNotif = {
          _id: `notif_${Date.now()}`,
          userId,
          type,
          title: title.trim(),
          message: message.trim(),
          link: link.trim(),
          metadata,
          read: false,
          createdAt: new Date().toISOString(),
        };
        DEMO_NOTIFICATIONS.unshift(fakeNotif);
        return fakeNotif;
      }

      const notification = await Notification.create({
        userId,
        type,
        title: title.trim(),
        message: message.trim(),
        link: link.trim(),
        metadata,
      });

      return notification;
    } catch (err) {
      logger.error('NotificationService.createNotification failed:', err.message);
      return null;
    }
  }

  // ─── Trigger Helper Methods ──────────────────────────────────────────────────

  static notifyRegistration(user) {
    const isStudent = user.role === 'STUDENT';
    return this.createNotification({
      userId: user._id,
      type: NOTIFICATION_TYPES.REGISTRATION_WELCOME,
      title: 'Welcome to InternHub! 🚀',
      message: `Welcome aboard, ${user.name}! ${
        isStudent
          ? 'Build your profile and discover verified software engineering internships.'
          : 'Complete your company profile and post internship opportunities to top engineering talent.'
      }`,
      link: isStudent ? '/student/profile' : '/recruiter',
      metadata: { role: user.role },
    });
  }

  static notifyEmailVerification(user) {
    return this.createNotification({
      userId: user._id,
      type: NOTIFICATION_TYPES.EMAIL_VERIFIED,
      title: 'Email Address Verified! ✅',
      message: `Your email (${user.email}) has been verified. Your verified badge is now active.`,
      link: user.role === 'STUDENT' ? '/internships' : '/recruiter',
      metadata: { email: user.email },
    });
  }

  static async notifyApplicationSubmitted(application, student, recruiterOwnerId, internship) {
    if (recruiterOwnerId) {
      await this.createNotification({
        userId: recruiterOwnerId,
        type: NOTIFICATION_TYPES.NEW_APPLICATION_RECEIVED,
        title: 'New Candidate Application 📥',
        message: `${student.name || 'A student'} submitted an application for "${internship.title}".`,
        link: `/recruiter/applications/${application._id}`,
        metadata: {
          applicationId: application._id,
          studentId: student._id,
          internshipId: internship._id,
        },
      });
    }

    return this.createNotification({
      userId: student._id,
      type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
      title: 'Application Confirmed 📝',
      message: `Your application for "${internship.title}" was submitted successfully. Track status updates on your timeline.`,
      link: `/student/applications/${application._id}`,
      metadata: {
        applicationId: application._id,
        internshipId: internship._id,
      },
    });
  }

  static notifyApplicationStatusChange(application, studentId, internshipTitle, newStatus, note = '') {
    return this.createNotification({
      userId: studentId,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED,
      title: `Application Status: ${newStatus.replace('_', ' ')}`,
      message: `Your application for "${internshipTitle}" has been updated to "${newStatus.replace(
        '_',
        ' '
      )}".${note ? ` Note: ${note}` : ''}`,
      link: `/student/applications/${application._id}`,
      metadata: {
        applicationId: application._id,
        status: newStatus,
        note,
      },
    });
  }

  static notifyInterviewScheduled(interview, studentId, internshipTitle, scheduledDate) {
    return this.createNotification({
      userId: studentId,
      type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
      title: 'Interview Invitation Received 📞',
      message: `You have an interview scheduled for "${internshipTitle}" on ${new Date(
        scheduledDate
      ).toLocaleString()}.`,
      link: '/student/interviews',
      metadata: {
        interviewId: interview._id,
        applicationId: interview.applicationId,
        scheduledDate,
      },
    });
  }

  static notifyInterviewRescheduled(interview, studentId, internshipTitle, newDate, reason = '') {
    return this.createNotification({
      userId: studentId,
      type: NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED,
      title: 'Interview Rescheduled 🔄',
      message: `Your interview for "${internshipTitle}" has been rescheduled to ${new Date(
        newDate
      ).toLocaleString()}.${reason ? ` Reason: ${reason}` : ''}`,
      link: '/student/interviews',
      metadata: {
        interviewId: interview._id,
        applicationId: interview.applicationId,
        newDate,
        reason,
      },
    });
  }

  static notifyInterviewCancelled(interview, studentId, internshipTitle = 'Internship', scheduledDate, reason = '') {
    return this.createNotification({
      userId: studentId,
      type: NOTIFICATION_TYPES.INTERVIEW_CANCELLED,
      title: 'Interview Cancelled ❌',
      message: `Your interview for "${internshipTitle}" on ${new Date(
        scheduledDate
      ).toLocaleString()} was cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      link: '/student/interviews',
      metadata: {
        interviewId: interview._id,
        applicationId: interview.applicationId,
        reason,
      },
    });
  }

  // ─── Query & State Management Methods ────────────────────────────────────────

  static async getUserNotifications(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...DEMO_NOTIFICATIONS];
      if (queryParams.unreadOnly === 'true') {
        filtered = filtered.filter((n) => !n.read);
      }
      const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;
      return {
        data: filtered.slice(skip, skip + limit),
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
        unreadCount,
      };
    }

    const filter = { userId };
    if (queryParams.unreadOnly === 'true') {
      filter.read = false;
    }
    if (queryParams.type && queryParams.type !== 'ALL') {
      filter.type = queryParams.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return {
      data: notifications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount,
    };
  }

  static async getUnreadCount(userId) {
    if (mongoose.connection.readyState !== 1) {
      return { unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.read).length };
    }
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    return { unreadCount };
  }

  static async markAsRead(userId, notificationId) {
    if (mongoose.connection.readyState !== 1) {
      const n = DEMO_NOTIFICATIONS.find((item) => item._id === notificationId);
      if (n) n.read = true;
      return n || { _id: notificationId, read: true };
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }

    return notification;
  }

  static async markAllAsRead(userId) {
    if (mongoose.connection.readyState !== 1) {
      DEMO_NOTIFICATIONS.forEach((n) => (n.read = true));
      return { success: true, message: 'All notifications marked as read.' };
    }

    await Notification.updateMany({ userId, read: false }, { read: true });
    return { success: true, message: 'All notifications marked as read.' };
  }

  static async deleteNotification(userId, notificationId) {
    if (mongoose.connection.readyState !== 1) {
      const idx = DEMO_NOTIFICATIONS.findIndex((n) => n._id === notificationId);
      if (idx !== -1) DEMO_NOTIFICATIONS.splice(idx, 1);
      return { success: true, message: 'Notification deleted successfully.' };
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }

    return { success: true, message: 'Notification deleted successfully.' };
  }

  static async clearReadNotifications(userId) {
    if (mongoose.connection.readyState !== 1) {
      return { success: true, message: 'Read notifications cleared.' };
    }

    await Notification.deleteMany({ userId, read: true });
    return { success: true, message: 'Read notifications cleared.' };
  }
}

export default NotificationService;
