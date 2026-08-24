import mongoose from 'mongoose';

export const SYNC_JOB_STATUS = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
};

export const SYNC_JOB_TYPE = {
  SCHEDULED_SYNC: 'SCHEDULED_SYNC',
  MANUAL_SYNC: 'MANUAL_SYNC',
  RECONCILIATION: 'RECONCILIATION',
  DEADLINE_EXPIRATION: 'DEADLINE_EXPIRATION',
};

const syncJobSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobType: {
      type: String,
      enum: Object.values(SYNC_JOB_TYPE),
      default: SYNC_JOB_TYPE.SCHEDULED_SYNC,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    fetchedCount: {
      type: Number,
      default: 0,
    },
    insertedCount: {
      type: Number,
      default: 0,
    },
    updatedCount: {
      type: Number,
      default: 0,
    },
    skippedCount: {
      type: Number,
      default: 0,
    },
    duplicateCount: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(SYNC_JOB_STATUS),
      default: SYNC_JOB_STATUS.RUNNING,
      index: true,
    },
    errorDetails: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'syncJobs',
  }
);

syncJobSchema.index({ source: 1, startedAt: -1 });
syncJobSchema.index({ status: 1, startedAt: -1 });

export const SyncJob = mongoose.model('SyncJob', syncJobSchema);
export default SyncJob;
