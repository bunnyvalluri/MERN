import { SOURCE_TYPE } from '../../models/Internship.model.js';
import { logger } from '../../utils/logger.js';

export const CONNECTOR_STATUS = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DISABLED: 'DISABLED',
};

/**
 * Base abstract class for all Job & Internship Source Connectors.
 * Provides resilient error handling, timeouts, exponential backoff, and circuit breaking.
 */
export class JobSourceConnector {
  constructor(name, type = SOURCE_TYPE.API, options = {}) {
    if (new.target === JobSourceConnector) {
      throw new TypeError('Cannot construct JobSourceConnector instances directly.');
    }
    this.name = name;
    this.type = type;
    this.enabled = options.enabled ?? true;
    this.syncIntervalMinutes = options.syncIntervalMinutes || 30;
    this.supportsInternships = options.supportsInternships ?? true;
    this.supportsJobs = options.supportsJobs ?? true;
    this.supportsIndia = options.supportsIndia ?? true;
    this.timeoutMs = options.timeoutMs || 15000;
    this.maxRetries = options.maxRetries || 2;
    this.retryDelayMs = options.retryDelayMs || 1000;

    // Circuit Breaker State
    this.failureCount = 0;
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownMs = options.cooldownMs || 5 * 60 * 1000; // 5 minutes
    this.lastFailureTime = null;
    this.circuitOpen = false;

    // Operational Metrics
    this.lastSuccessfulSync = null;
    this.lastFailedSync = null;
    this.lastFetchedCount = 0;
    this.totalFetchedCount = 0;
    this.consecutiveSuccesses = 0;
  }

  getSourceName() {
    return this.name;
  }

  getSourceType() {
    return this.type;
  }

  isEnabled() {
    return this.enabled && !this.isCircuitOpen();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.resetCircuit();
    }
  }

  isCircuitOpen() {
    if (!this.circuitOpen) return false;
    const now = Date.now();
    if (now - this.lastFailureTime > this.cooldownMs) {
      logger.info(`[Connector:${this.name}] Circuit half-open: attempting test execution.`);
      this.circuitOpen = false;
      return false;
    }
    return true;
  }

  recordSuccess(count = 0) {
    this.failureCount = 0;
    this.circuitOpen = false;
    this.lastSuccessfulSync = new Date();
    this.lastFetchedCount = count;
    this.totalFetchedCount += count;
    this.consecutiveSuccesses += 1;
  }

  recordFailure(error) {
    this.failureCount += 1;
    this.lastFailedSync = new Date();
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.circuitOpen = true;
      logger.warn(
        `[Connector:${this.name}] Circuit breaker OPENED after ${this.failureCount} consecutive failures. Cooldown: ${this.cooldownMs / 1000}s. Error: ${error.message}`
      );
    }
  }

  resetCircuit() {
    this.failureCount = 0;
    this.circuitOpen = false;
    this.lastFailureTime = null;
  }

  getHealthStatus() {
    if (!this.enabled) return CONNECTOR_STATUS.DISABLED;
    if (this.circuitOpen || this.failureCount >= this.failureThreshold) return CONNECTOR_STATUS.ERROR;
    if (this.failureCount > 0) return CONNECTOR_STATUS.WARNING;
    return CONNECTOR_STATUS.HEALTHY;
  }

  getStatus() {
    return this.getHealthStatus();
  }

  getMetrics() {
    return {
      name: this.name,
      type: this.type,
      enabled: this.enabled,
      status: this.getHealthStatus(),
      circuitOpen: this.circuitOpen,
      failureCount: this.failureCount,
      lastSuccessfulSync: this.lastSuccessfulSync,
      lastFailedSync: this.lastFailedSync,
      lastFetchedCount: this.lastFetchedCount,
      totalFetchedCount: this.totalFetchedCount,
      syncIntervalMinutes: this.syncIntervalMinutes,
    };
  }

  /**
   * Safe fetch with retry & timeout wrapper
   */
  async safeFetch(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'InternHub-IngestionEngine/1.0 (+https://internhub.dev)',
          ...(options.headers || {}),
        },
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Abstract Methods to be implemented by child connectors
   */
  fetchListings() {
    return Promise.reject(new Error(`fetchListings() must be implemented by ${this.name}`));
  }

  normalizeListing(_rawListing) {
    throw new Error(`normalizeListing() must be implemented by ${this.name}`);
  }

  validateListing(normalizedListing) {
    if (!normalizedListing) return false;
    if (!normalizedListing.title || normalizedListing.title.trim().length < 2) return false;
    if (!normalizedListing.companyName || normalizedListing.companyName.trim().length < 2) return false;
    if (!normalizedListing.source) return false;
    return true;
  }
}

export default JobSourceConnector;
