import { JobSourceConnector } from '../base/JobSourceConnector.js';
import { SOURCE_TYPE, INTERNSHIP_STATUS, APPLICATION_METHOD } from '../../models/Internship.model.js';
import { Internship } from '../../models/Internship.model.js';
import { logger } from '../../utils/logger.js';

/**
 * Connector for InternHub employer-created and recruiter-submitted listings.
 */
export class InternalEmployerConnector extends JobSourceConnector {
  constructor(options = {}) {
    super('InternHub Recruiter Network', SOURCE_TYPE.EMPLOYER, {
      enabled: options.enabled ?? true,
      syncIntervalMinutes: options.syncIntervalMinutes || 15,
      supportsIndia: true,
      supportsInternships: true,
      supportsJobs: true,
      ...options,
    });
  }

  async fetchListings() {
    try {
      logger.info('[InternalEmployerConnector] Reconciling internal employer listings');
      const internalDocs = await Internship.find({
        sourceType: { $in: [SOURCE_TYPE.INTERNAL, SOURCE_TYPE.EMPLOYER] },
        status: INTERNSHIP_STATUS.PUBLISHED,
        isActive: true,
      })
        .populate('companyId')
        .lean();

      const normalized = internalDocs
        .map((doc) => this.normalizeListing(doc))
        .filter((item) => this.validateListing(item));

      this.recordSuccess(normalized.length);
      return normalized;
    } catch (err) {
      this.recordFailure(err);
      logger.error(`[InternalEmployerConnector] Internal reconciliation failed: ${err.message}`);
      return [];
    }
  }

  normalizeListing(doc) {
    if (!doc) return null;

    const companyName = doc.companyName || doc.companyId?.name || 'InternHub Partner';
    const companyLogo = doc.companyLogo || doc.companyId?.logo || null;

    return {
      externalId: String(doc._id),
      source: this.getSourceName(),
      sourceType: doc.sourceType || SOURCE_TYPE.EMPLOYER,
      sourceUrl: `/internships/${doc.slug || doc._id}`,
      canonicalUrl: `/internships/${doc.slug || doc._id}`,
      title: doc.title,
      companyId: doc.companyId?._id || doc.companyId,
      companyName,
      companyLogo,
      companyWebsite: doc.companyWebsite || doc.companyId?.website || '',
      description: doc.description,
      shortDescription: doc.shortDescription || `Direct employer opportunity at ${companyName}`,
      employmentType: doc.employmentType || 'INTERNSHIP',
      opportunityType: doc.opportunityType || 'INTERNSHIP',
      workMode: doc.workMode || doc.remote || 'REMOTE',
      location: doc.location || { city: doc.city || 'Remote', country: 'India' },
      city: doc.city || doc.location?.city || 'Remote',
      country: doc.country || doc.location?.country || 'India',
      skills: doc.skills || [],
      category: doc.category || 'Software Development',
      duration: doc.duration || '3 Months',
      applicationDeadline: doc.applicationDeadline,
      postedAt: doc.postedAt || doc.createdAt || new Date(),
      lastVerifiedAt: new Date(),
      isVerified: true,
      applicationUrl: doc.applicationUrl || '',
      applicationMethod: doc.applicationMethod || APPLICATION_METHOD.INTERNAL,
      stipend: doc.stipend || {
        amount: null,
        currency: 'INR',
        period: 'MONTH',
        isUnpaid: false,
      },
      metadata: doc.metadata || {},
    };
  }
}

export default InternalEmployerConnector;
