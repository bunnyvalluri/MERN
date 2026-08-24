import mongoose from 'mongoose';

/**
 * AnalyticsEvent — privacy-safe user interaction tracking.
 * Never stores PII — user is referenced by ID only.
 * Used for product analytics, search trend analysis, and recommendation signals.
 */

export const ANALYTICS_EVENT_TYPES = Object.freeze({
  // Discovery
  INTERNSHIP_VIEWED: 'INTERNSHIP_VIEWED',
  INTERNSHIP_SEARCHED: 'INTERNSHIP_SEARCHED',
  INTERNSHIP_FILTERED: 'INTERNSHIP_FILTERED',
  INTERNSHIP_SAVED: 'INTERNSHIP_SAVED',
  INTERNSHIP_UNSAVED: 'INTERNSHIP_UNSAVED',
  INTERNSHIP_SHARED: 'INTERNSHIP_SHARED',
  // Application funnel
  APPLICATION_STARTED: 'APPLICATION_STARTED',
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_WITHDRAWN: 'APPLICATION_WITHDRAWN',
  // Company discovery
  COMPANY_VIEWED: 'COMPANY_VIEWED',
  COMPANY_SEARCHED: 'COMPANY_SEARCHED',
  // Auth
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  // Platform
  PAGE_VIEWED: 'PAGE_VIEWED',
  SSE_CONNECTED: 'SSE_CONNECTED',
});

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: Object.values(ANALYTICS_EVENT_TYPES),
      index: true,
    },
    // User reference (null for anonymous visitors)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // Anonymous session fingerprint
    sessionId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    // The entity this event relates to
    entityId: {
      type: String,
      default: null,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['INTERNSHIP', 'COMPANY', 'APPLICATION', 'USER', 'PAGE'],
      default: null,
    },
    // Flexible metadata bag (search query, filters applied, page path, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Request context
    ip: {
      type: String,
      default: null,
      select: false, // Never expose in API responses
    },
    userAgent: {
      type: String,
      default: null,
      select: false,
    },
    referrer: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Events are immutable
    collection: 'analyticsevents',
  }
);

// Compound index for time-series aggregations
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
// For per-user funnels
analyticsEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
// TTL index — auto-delete events older than 90 days to manage storage
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
