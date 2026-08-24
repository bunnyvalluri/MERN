import mongoose from 'mongoose';

/**
 * DataSource — represents a configured ingestion data source.
 * Tracks operational health, sync schedules, and error rates.
 */
const dataSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Data source name is required'],
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['RSS_FEED', 'JSON_API', 'HTML_SCRAPER', 'GRAPHQL', 'WEBHOOK', 'MANUAL'],
      uppercase: true,
      trim: true,
    },
    baseUrl: {
      type: String,
      required: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    syncIntervalMinutes: {
      type: Number,
      default: 60,
      min: [5, 'Sync interval must be at least 5 minutes'],
    },
    // Authentication configuration (store reference, never raw secrets)
    authType: {
      type: String,
      enum: ['NONE', 'API_KEY', 'BEARER_TOKEN', 'BASIC_AUTH', 'OAUTH2'],
      default: 'NONE',
    },
    authHeader: {
      type: String,
      trim: true,
      default: null,
      select: false, // Never expose via API
    },
    // Operational stats
    lastSyncAt: {
      type: Date,
      default: null,
    },
    nextSyncAt: {
      type: Date,
      default: null,
    },
    lastSyncStatus: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED'],
      default: 'PENDING',
    },
    lastErrorMessage: {
      type: String,
      default: null,
    },
    // Cumulative statistics
    totalFetched: {
      type: Number,
      default: 0,
    },
    totalInserted: {
      type: Number,
      default: 0,
    },
    totalUpdated: {
      type: Number,
      default: 0,
    },
    totalDuplicates: {
      type: Number,
      default: 0,
    },
    totalErrors: {
      type: Number,
      default: 0,
    },
    consecutiveFailures: {
      type: Number,
      default: 0,
    },
    // Metadata
    description: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'datasources',
  }
);

dataSourceSchema.index({ enabled: 1, nextSyncAt: 1 });
dataSourceSchema.index({ lastSyncStatus: 1 });

export const DataSource = mongoose.model('DataSource', dataSourceSchema);
export default DataSource;
