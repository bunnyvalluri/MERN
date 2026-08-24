import { IngestionService } from './ingestion.service.js';
import { FreshnessService } from './freshness.service.js';
import { SYNC_JOB_TYPE } from '../models/SyncJob.model.js';
import { logger } from '../utils/logger.js';

export class SchedulerService {
  constructor() {
    this.syncIntervalId = null;
    this.freshnessIntervalId = null;
    this.isRunning = false;
    this.syncIntervalMinutes = 30; // 30 mins default
    this.freshnessIntervalMinutes = 15; // 15 mins default
  }

  /**
   * Starts background continuous synchronization and deadline workers.
   */
  start() {
    if (this.isRunning) {
      logger.warn('[Scheduler] Scheduler is already running.');
      return;
    }

    this.isRunning = true;
    logger.info(
      `[Scheduler] Starting background worker scheduler (Sync: every ${this.syncIntervalMinutes}m, Freshness: every ${this.freshnessIntervalMinutes}m)`
    );

    // Initial background run (delayed 10 seconds to allow server boot and initial connection)
    setTimeout(() => {
      this.runSyncCycle();
      this.runFreshnessCycle();
    }, 10_000);

    // Recurring Sync timer
    this.syncIntervalId = setInterval(
      () => this.runSyncCycle(),
      this.syncIntervalMinutes * 60 * 1000
    );

    // Recurring Freshness & Deadline sweep timer
    this.freshnessIntervalId = setInterval(
      () => this.runFreshnessCycle(),
      this.freshnessIntervalMinutes * 60 * 1000
    );
  }

  async runSyncCycle() {
    logger.info('[Scheduler] >>> Triggering scheduled connector sync cycle...');
    try {
      await IngestionService.syncAllSources(SYNC_JOB_TYPE.SCHEDULED_SYNC);
    } catch (err) {
      logger.error(`[Scheduler] Sync cycle encountered error: ${err.message}`);
    }
  }

  async runFreshnessCycle() {
    logger.info('[Scheduler] >>> Triggering scheduled freshness & deadline sweep...');
    try {
      await FreshnessService.processDeadlines();
      await FreshnessService.updateFreshnessStates();
    } catch (err) {
      logger.error(`[Scheduler] Freshness sweep encountered error: ${err.message}`);
    }
  }

  /**
   * Stops background intervals on server shutdown.
   */
  stop() {
    if (this.syncIntervalId) clearInterval(this.syncIntervalId);
    if (this.freshnessIntervalId) clearInterval(this.freshnessIntervalId);
    this.isRunning = false;
    logger.info('[Scheduler] Background worker scheduler stopped.');
  }
}

export const schedulerService = new SchedulerService();
export default schedulerService;
