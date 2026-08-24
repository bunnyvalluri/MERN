import { ArbeitnowConnector } from './apis/ArbeitnowConnector.js';
import { JobicyConnector } from './apis/JobicyConnector.js';
import { GreenhousePublicConnector } from './ats/GreenhousePublicConnector.js';
import { InternalEmployerConnector } from './internal/InternalEmployerConnector.js';
import { logger } from '../utils/logger.js';

/**
 * SOURCE_REGISTRY
 * Centralized catalog and life-cycle manager for all authorized ingestion connectors.
 */
class SourceRegistry {
  constructor() {
    this.connectors = new Map();
    this.initializeDefaultConnectors();
  }

  initializeDefaultConnectors() {
    // 1. Arbeitnow API Connector
    const arbeitnow = new ArbeitnowConnector({
      enabled: process.env.ARBEITNOW_ENABLED !== 'false',
      syncIntervalMinutes: 30,
    });
    this.registerConnector(arbeitnow);

    // 2. Jobicy API Connector
    const jobicy = new JobicyConnector({
      enabled: process.env.JOBICY_ENABLED !== 'false',
      syncIntervalMinutes: 30,
    });
    this.registerConnector(jobicy);

    // 3. Greenhouse Public Board Connector
    const greenhouse = new GreenhousePublicConnector({
      enabled: process.env.GREENHOUSE_ENABLED !== 'false',
      syncIntervalMinutes: 60,
    });
    this.registerConnector(greenhouse);

    // 4. Internal Employer Postings Connector
    const internal = new InternalEmployerConnector({
      enabled: true,
      syncIntervalMinutes: 15,
    });
    this.registerConnector(internal);

    logger.info(`[SourceRegistry] Initialized with ${this.connectors.size} ingestion connectors.`);
  }

  registerConnector(connector) {
    if (!connector || !connector.getSourceName) {
      throw new Error('Invalid connector registered in SourceRegistry');
    }
    this.connectors.set(connector.getSourceName(), connector);
  }

  getConnector(name) {
    return this.connectors.get(name);
  }

  getAllConnectors() {
    return Array.from(this.connectors.values());
  }

  getEnabledConnectors() {
    return Array.from(this.connectors.values()).filter((c) => c.isEnabled());
  }

  setSourceEnabled(name, enabled) {
    const connector = this.connectors.get(name);
    if (connector) {
      connector.setEnabled(enabled);
      logger.info(`[SourceRegistry] Source [${name}] enabled state set to: ${enabled}`);
      return true;
    }
    return false;
  }

  getMetrics() {
    return Array.from(this.connectors.values()).map((c) => c.getMetrics());
  }
}

export const sourceRegistry = new SourceRegistry();
export { SourceRegistry };
export default sourceRegistry;
