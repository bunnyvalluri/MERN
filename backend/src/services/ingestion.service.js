import crypto from 'crypto';
import mongoose from 'mongoose';
import { Internship, INTERNSHIP_STATUS, FRESHNESS_STATE } from '../models/Internship.model.js';
import { SyncJob, SYNC_JOB_STATUS, SYNC_JOB_TYPE } from '../models/SyncJob.model.js';
import { sourceRegistry } from '../connectors/SourceRegistry.js';
import { eventBus, SYSTEM_EVENTS } from '../utils/eventBus.js';
import { logger } from '../utils/logger.js';

/**
 * Generates deterministic SHA-256 fingerprint for deduplication.
 */
export function generateFingerprint(company, title, location, canonicalUrl) {
  const normCompany = (company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normLocation = (typeof location === 'object' ? `${location.city || ''} ${location.country || ''}` : location || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const normUrl = (canonicalUrl || '')
    .trim()
    .toLowerCase()
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  const rawKey = `${normCompany}|${normTitle}|${normLocation}|${normUrl}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Generates unique, URL-safe slug from title, company, and short hash.
 */
export function generateSlug(title, company) {
  const baseTitle = (title || 'internship').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const baseCompany = (company || 'tech').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const shortHash = crypto.randomBytes(3).toString('hex');
  return `${baseTitle}-at-${baseCompany}-${shortHash}`.slice(0, 100);
}

/**
 * Sanitizes text content by stripping risky HTML script tags.
 */
export function sanitizeContent(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
}

export class IngestionService {
  /**
   * Runs ingestion for a single connector instance.
   */
  static async ingestFromConnector(connector, jobType = SYNC_JOB_TYPE.SCHEDULED_SYNC, triggeredBy = null) {
    if (!connector || !connector.isEnabled()) {
      logger.info(`[Ingestion] Connector ${connector?.getSourceName()} is disabled or not available.`);
      return null;
    }

    const sourceName = connector.getSourceName();
    const startTime = Date.now();
    logger.info(`[Ingestion] >>> Starting sync run for [${sourceName}]`);

    // Create tracking SyncJob document if MongoDB connected
    let syncJobDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        syncJobDoc = await SyncJob.create({
          source: sourceName,
          jobType,
          startedAt: new Date(),
          status: SYNC_JOB_STATUS.RUNNING,
          triggeredBy,
        });
      } catch (err) {
        logger.warn(`[Ingestion] Failed to create initial SyncJob doc: ${err.message}`);
      }
    }

    const stats = {
      source: sourceName,
      fetchedCount: 0,
      insertedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      errorDetails: [],
    };

    try {
      // 1. Fetch raw listings from connector
      const listings = await connector.fetchListings();
      stats.fetchedCount = Array.isArray(listings) ? listings.length : 0;

      // 2. Process each listing through validation, normalization, deduplication & upsert
      if (mongoose.connection.readyState === 1 && stats.fetchedCount > 0) {
        for (const item of listings) {
          try {
            await this.processAndUpsertListing(item, stats);
          } catch (itemErr) {
            stats.errorCount += 1;
            stats.errorDetails.push(`Error on "${item.title}": ${itemErr.message}`);
          }
        }
      }

      const durationMs = Date.now() - startTime;
      const finalStatus = stats.errorCount > 0 && stats.insertedCount === 0 && stats.updatedCount === 0
        ? SYNC_JOB_STATUS.FAILED
        : stats.errorCount > 0
        ? SYNC_JOB_STATUS.PARTIAL
        : SYNC_JOB_STATUS.SUCCESS;

      // Update SyncJob record
      if (syncJobDoc) {
        await SyncJob.findByIdAndUpdate(syncJobDoc._id, {
          completedAt: new Date(),
          durationMs,
          fetchedCount: stats.fetchedCount,
          insertedCount: stats.insertedCount,
          updatedCount: stats.updatedCount,
          skippedCount: stats.skippedCount,
          duplicateCount: stats.duplicateCount,
          errorCount: stats.errorCount,
          status: finalStatus,
          errorDetails: stats.errorDetails.slice(0, 20),
        });
      }

      logger.info(
        `[Ingestion] <<< Completed [${sourceName}] in ${durationMs}ms | Fetched: ${stats.fetchedCount} | Inserted: ${stats.insertedCount} | Updated: ${stats.updatedCount} | Duplicates: ${stats.duplicateCount} | Errors: ${stats.errorCount}`
      );

      // Emit event for real-time subscribers
      eventBus.emit(SYSTEM_EVENTS.SYNC_COMPLETED, {
        source: sourceName,
        insertedCount: stats.insertedCount,
        updatedCount: stats.updatedCount,
        totalFetched: stats.fetchedCount,
        timestamp: new Date(),
      });

      return {
        ...stats,
        durationMs,
        status: finalStatus,
      };
    } catch (fatalErr) {
      const durationMs = Date.now() - startTime;
      logger.error(`[Ingestion] Fatal failure during [${sourceName}] sync: ${fatalErr.message}`);

      if (syncJobDoc) {
        await SyncJob.findByIdAndUpdate(syncJobDoc._id, {
          completedAt: new Date(),
          durationMs,
          status: SYNC_JOB_STATUS.FAILED,
          errorDetails: [fatalErr.message],
        });
      }

      return {
        ...stats,
        durationMs,
        status: SYNC_JOB_STATUS.FAILED,
        error: fatalErr.message,
      };
    }
  }

  /**
   * Processes a single normalized listing: sanitizes, computes SHA-256 fingerprint,
   * performs deduplication, and upserts into MongoDB.
   */
  static async processAndUpsertListing(item, stats) {
    if (!item || !item.title || !item.companyName) {
      stats.skippedCount += 1;
      return;
    }

    // 1. Sanitize description
    const sanitizedDesc = sanitizeContent(item.description);

    // 2. Compute deterministic SHA-256 fingerprint
    const fingerprint = generateFingerprint(
      item.companyName,
      item.title,
      item.location,
      item.canonicalUrl || item.applicationUrl
    );

    // 3. Search for existing document by fingerprint OR by (source + externalId)
    const existing = await Internship.findOne({
      $or: [
        { fingerprint },
        { source: item.source, externalId: item.externalId },
      ],
    });

    const now = new Date();

    if (existing) {
      // 4. Duplicate / Existing Listing Update
      stats.duplicateCount += 1;

      const sourceRef = {
        name: item.source,
        externalId: String(item.externalId || ''),
        url: item.canonicalUrl || item.applicationUrl || '',
        lastSeenAt: now,
      };

      const existingSources = existing.sources || [];
      const hasSource = existingSources.some(
        (s) => s.name === item.source && s.externalId === String(item.externalId)
      );

      const updatePayload = {
        lastVerifiedAt: now,
        status: INTERNSHIP_STATUS.PUBLISHED,
        isActive: true,
        freshnessState: FRESHNESS_STATE.LIVE,
      };

      if (!hasSource) {
        updatePayload.$push = { sources: sourceRef };
      }

      await Internship.findByIdAndUpdate(existing._id, updatePayload);
      stats.updatedCount += 1;

      eventBus.emit(SYSTEM_EVENTS.INTERNSHIP_UPDATED, {
        id: existing._id,
        title: existing.title,
        company: existing.companyName,
        source: item.source,
      });
    } else {
      // 5. New Listing Creation
      const slug = generateSlug(item.title, item.companyName);

      const newListing = await Internship.create({
        ...item,
        description: sanitizedDesc,
        fingerprint,
        slug,
        sources: [
          {
            name: item.source,
            externalId: String(item.externalId || ''),
            url: item.canonicalUrl || item.applicationUrl || '',
            lastSeenAt: now,
          },
        ],
        status: INTERNSHIP_STATUS.PUBLISHED,
        isActive: true,
        freshnessState: FRESHNESS_STATE.LIVE,
        postedAt: item.postedAt || now,
        lastVerifiedAt: now,
      });

      stats.insertedCount += 1;

      eventBus.emit(SYSTEM_EVENTS.INTERNSHIP_CREATED, {
        id: newListing._id,
        title: newListing.title,
        company: newListing.companyName,
        slug: newListing.slug,
        source: item.source,
        workMode: newListing.workMode,
      });
    }
  }

  /**
   * Syncs all enabled connectors sequentially to avoid overwhelming rate limits.
   */
  static async syncAllSources(jobType = SYNC_JOB_TYPE.SCHEDULED_SYNC, triggeredBy = null) {
    const connectors = sourceRegistry.getEnabledConnectors();
    logger.info(`[Ingestion] Running batch sync across ${connectors.length} active connectors.`);

    const results = [];
    for (const connector of connectors) {
      try {
        const res = await this.ingestFromConnector(connector, jobType, triggeredBy);
        if (res) results.push(res);
      } catch (err) {
        logger.error(`[Ingestion] Failed connector execution for ${connector.getSourceName()}: ${err.message}`);
      }
    }

    return results;
  }
}

export default IngestionService;
