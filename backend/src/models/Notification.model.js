import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = {
  REGISTRATION_WELCOME: 'REGISTRATION_WELCOME',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_REVIEWED: 'APPLICATION_REVIEWED',
  APPLICATION_SHORTLISTED: 'APPLICATION_SHORTLISTED',
  APPLICATION_REJECTED: 'APPLICATION_REJECTED',
  APPLICATION_SELECTED: 'APPLICATION_SELECTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_RESCHEDULED: 'INTERVIEW_RESCHEDULED',
  INTERVIEW_CANCELLED: 'INTERVIEW_CANCELLED',
  NEW_APPLICATION_RECEIVED: 'NEW_APPLICATION_RECEIVED',
  APPLICATION_STATUS_UPDATED: 'APPLICATION_STATUS_UPDATED',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
};

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      default: NOTIFICATION_TYPES.SYSTEM_ALERT,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

// Compound index for user unread notification badge queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
