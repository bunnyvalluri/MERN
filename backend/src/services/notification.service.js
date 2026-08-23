import { Notification, NOTIFICATION_TYPES } from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

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
      return null; // Non-blocking failure
    }
  }

  // ─── Trigger Helper Methods ──────────────────────────────────────────────────

  /**
   * 1. Registration Welcome Notification
   */
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

  /**
   * 2. Email Verified Notification
   */
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

  /**
   * 3. Application Submitted Notifications (Dual trigger for Recruiter & Student)
   */
  static async notifyApplicationSubmitted(application, student, recruiterOwnerId, internship) {
    // A. Notify Recruiter
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

    // B. Notify Student
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

  /**
   * 4. Application Status Updates (Reviewed, Shortlisted, Rejected, Selected)
   */
  static notifyApplicationStatusChange(
    application,
    status,
    studentId,
    internshipTitle = 'Internship',
    reason = ''
  ) {
    let type = NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED;
    let title = 'Application Status Updated 📋';
    let message = `Your application for "${internshipTitle}" was updated to ${status.replace('_', ' ')}.`;

    switch (status) {
      case 'UNDER_REVIEW':
        type = NOTIFICATION_TYPES.APPLICATION_REVIEWED;
        title = 'Application Under Review 🔍';
        message = `The hiring team has started reviewing your profile and resume for "${internshipTitle}".`;
        break;
      case 'SHORTLISTED':
        type = NOTIFICATION_TYPES.APPLICATION_SHORTLISTED;
        title = 'Congratulations! You are Shortlisted 🎉';
        message = `Great news! You have been shortlisted for "${internshipTitle}". The recruiter may reach out to schedule an interview.`;
        break;
      case 'SELECTED':
        type = NOTIFICATION_TYPES.APPLICATION_SELECTED;
        title = 'Selected / Offer Extended! 🌟';
        message = `Congratulations! You have been selected for "${internshipTitle}". Check your email or timeline for next steps.`;
        break;
      case 'REJECTED':
        type = NOTIFICATION_TYPES.APPLICATION_REJECTED;
        title = 'Application Update';
        message = `Thank you for applying to "${internshipTitle}". The company has chosen to move forward with other candidates.${
          reason ? ` Note: ${reason}` : ''
        }`;
        break;
      default:
        break;
    }

    return this.createNotification({
      userId: studentId,
      type,
      title,
      message,
      link: `/student/applications/${application._id}`,
      metadata: {
        applicationId: application._id,
        status,
        reason,
      },
    });
  }

  /**
   * 5. Interview Scheduled Notification
   */
  static notifyInterviewScheduled(
    interview,
    studentId,
    internshipTitle = 'Internship',
    scheduledAt,
    meetingLink = ''
  ) {
    return this.createNotification({
      userId: studentId,
      type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
      title: 'Interview Scheduled! 📅',
      message: `An interview for "${internshipTitle}" has been scheduled for ${new Date(
        scheduledAt
      ).toLocaleString()}.`,
      link: '/student/interviews',
      metadata: {
        interviewId: interview._id,
        applicationId: interview.applicationId,
        scheduledAt,
        meetingLink,
      },
    });
  }

  /**
   * 6. Interview Rescheduled Notification
   */
  static notifyInterviewRescheduled(
    interview,
    studentId,
    internshipTitle = 'Internship',
    newDate,
    reason = ''
  ) {
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

  /**
   * 7. Interview Cancelled Notification
   */
  static notifyInterviewCancelled(
    interview,
    studentId,
    internshipTitle = 'Internship',
    scheduledDate,
    reason = ''
  ) {
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

  /**
   * Retrieves paginated notifications for the authenticated user.
   */
  static async getUserNotifications(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

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

  /**
   * Fast count of unread notifications for badges.
   */
  static async getUnreadCount(userId) {
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    return { unreadCount };
  }

  /**
   * Marks a single notification as read.
   */
  static async markAsRead(userId, notificationId) {
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

  /**
   * Marks all notifications as read for a user.
   */
  static async markAllAsRead(userId) {
    await Notification.updateMany({ userId, read: false }, { read: true });
    return { success: true, message: 'All notifications marked as read.' };
  }

  /**
   * Deletes a specific notification.
   */
  static async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }

    return { success: true, message: 'Notification deleted successfully.' };
  }

  /**
   * Clears all read notifications for a user.
   */
  static async clearReadNotifications(userId) {
    await Notification.deleteMany({ userId, read: true });
    return { success: true, message: 'Read notifications cleared.' };
  }
}

export default NotificationService;
