import mongoose from 'mongoose';
import { Internship, INTERNSHIP_STATUS, FRESHNESS_STATE } from '../models/Internship.model.js';
import { SyncJob, SYNC_JOB_STATUS, SYNC_JOB_TYPE } from '../models/SyncJob.model.js';
import { eventBus, SYSTEM_EVENTS } from '../utils/eventBus.js';
import { logger } from '../utils/logger.js';

export class FreshnessService {
  /**
   * Processes all active internships to detect passed application deadlines
   * and marks them as EXPIRED / inactive.
   */
  static async processDeadlines() {
    if (mongoose.connection.readyState !== 1) {
      return { expiredCount: 0 };
    }

    const startTime = Date.now();
    logger.info('[FreshnessService] Running deadline expiration sweep...');

    try {
      const now = new Date();

      // Find all active internships whose deadline has passed
      const expiredDocs = await Internship.find({
        isActive: true,
        status: INTERNSHIP_STATUS.PUBLISHED,
        applicationDeadline: { $lt: now },
      }).select('_id title companyName applicationDeadline');

      if (expiredDocs.length === 0) {
        logger.info('[FreshnessService] No expired internships found.');
        return { expiredCount: 0 };
      }

      const expiredIds = expiredDocs.map((d) => d._id);

      const result = await Internship.updateMany(
        { _id: { $in: expiredIds } },
        {
          $set: {
            isActive: false,
            status: INTERNSHIP_STATUS.EXPIRED,
            freshnessState: FRESHNESS_STATE.EXPIRED,
          },
        }
      );

      const durationMs = Date.now() - startTime;
      logger.info(
        `[FreshnessService] Expired ${result.modifiedCount} listings in ${durationMs}ms.`
      );

      // Log to SyncJob ledger
      await SyncJob.create({
        source: 'SYSTEM_DEADLINE_PROCESSOR',
        jobType: SYNC_JOB_TYPE.DEADLINE_EXPIRATION,
        startedAt: new Date(startTime),
        completedAt: now,
        durationMs,
        fetchedCount: expiredDocs.length,
        updatedCount: result.modifiedCount,
        status: SYNC_JOB_STATUS.SUCCESS,
      });

      // Emit expiration events
      for (const doc of expiredDocs) {
        eventBus.emit(SYSTEM_EVENTS.INTERNSHIP_EXPIRED, {
          id: doc._id,
          title: doc.title,
          company: doc.companyName,
        });
      }

      return { expiredCount: result.modifiedCount };
    } catch (err) {
      logger.error(`[FreshnessService] Deadline sweep failed: ${err.message}`);
      return { expiredCount: 0, error: err.message };
    }
  }

  /**
   * Re-evaluates freshness states (LIVE -> RECENT -> STALE) based on lastVerifiedAt.
   */
  static async updateFreshnessStates() {
    if (mongoose.connection.readyState !== 1) return;

    try {
      const now = Date.now();
      const threeDaysAgo = new Date(now - 3 * 24 * 3600 * 1000);
      const sevenDaysAgo = new Date(now - 7 * 24 * 3600 * 1000);

      // 1. Mark older than 7 days as STALE
      await Internship.updateMany(
        {
          isActive: true,
          status: INTERNSHIP_STATUS.PUBLISHED,
          lastVerifiedAt: { $lt: sevenDaysAgo },
          freshnessState: { $ne: FRESHNESS_STATE.STALE },
        },
        { $set: { freshnessState: FRESHNESS_STATE.STALE } }
      );

      // 2. Mark between 3 and 7 days as RECENT
      await Internship.updateMany(
        {
          isActive: true,
          status: INTERNSHIP_STATUS.PUBLISHED,
          lastVerifiedAt: { $gte: sevenDaysAgo, $lt: threeDaysAgo },
          freshnessState: { $ne: FRESHNESS_STATE.RECENT },
        },
        { $set: { freshnessState: FRESHNESS_STATE.RECENT } }
      );
    } catch (err) {
      logger.warn(`[FreshnessService] Freshness state update error: ${err.message}`);
    }
  }
}

export default FreshnessService;
