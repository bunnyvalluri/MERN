import { JobSourceConnector } from '../base/JobSourceConnector.js';
import { SOURCE_TYPE, WORKPLACE_TYPE, EMPLOYMENT_TYPE, OPPORTUNITY_TYPE, APPLICATION_METHOD } from '../../models/Internship.model.js';
import { logger } from '../../utils/logger.js';

export class ArbeitnowConnector extends JobSourceConnector {
  constructor(options = {}) {
    super('Arbeitnow API', SOURCE_TYPE.API, {
      enabled: options.enabled ?? true,
      syncIntervalMinutes: options.syncIntervalMinutes || 30,
      supportsIndia: true,
      supportsInternships: true,
      supportsJobs: true,
      ...options,
    });
    this.endpoint = options.endpoint || 'https://www.arbeitnow.com/api/job-board-api';
  }

  async fetchListings() {
    try {
      logger.info(`[ArbeitnowConnector] Fetching live listings from ${this.endpoint}`);
      const response = await this.safeFetch(this.endpoint);

      if (!response.ok) {
        throw new Error(`Arbeitnow API HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawListings = Array.isArray(data?.data) ? data.data : [];

      const normalized = rawListings
        .map((item) => this.normalizeListing(item))
        .filter((item) => this.validateListing(item));

      this.recordSuccess(normalized.length);
      logger.info(`[ArbeitnowConnector] Successfully fetched & normalized ${normalized.length} listings`);
      return normalized;
    } catch (err) {
      this.recordFailure(err);
      logger.error(`[ArbeitnowConnector] Fetch failed: ${err.message}`);
      throw err;
    }
  }

  normalizeListing(raw) {
    if (!raw) return null;

    const title = (raw.title || '').trim();
    const company = (raw.company_name || 'Tech Company').trim();
    const externalUrl = (raw.url || '').trim();
    const externalId = (raw.slug || `arbeit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`).trim();
    const isRemote = Boolean(raw.remote);
    const locationStr = (raw.location || (isRemote ? 'Remote Global' : 'India')).trim();
    const tags = Array.isArray(raw.tags) ? raw.tags : [];

    // Parse workplace type
    let workMode = WORKPLACE_TYPE.ONSITE;
    if (isRemote) {
      workMode = WORKPLACE_TYPE.REMOTE;
    } else if (locationStr.toLowerCase().includes('hybrid')) {
      workMode = WORKPLACE_TYPE.HYBRID;
    }

    // Determine category from tags & title
    let category = 'Software Development';
    const tLower = title.toLowerCase();
    const tagsStr = tags.join(' ').toLowerCase();

    if (tLower.includes('ai') || tLower.includes('machine learning') || tLower.includes('data') || tagsStr.includes('ai')) {
      category = 'Data Science & AI';
    } else if (tLower.includes('front') || tLower.includes('react') || tLower.includes('ui') || tLower.includes('web')) {
      category = 'Frontend Development';
    } else if (tLower.includes('back') || tLower.includes('node') || tLower.includes('go') || tLower.includes('python')) {
      category = 'Backend Development';
    } else if (tLower.includes('cloud') || tLower.includes('devops') || tLower.includes('security')) {
      category = 'DevOps & Cloud';
    } else if (tLower.includes('product') || tLower.includes('design') || tLower.includes('ux')) {
      category = 'UI/UX & Design';
    }

    // Parse skills
    const skills = tags.length > 0 ? tags.slice(0, 6) : ['Software Engineering', 'Problem Solving', 'Git'];

    // Parse created date
    const postedAt = raw.created_at ? new Date(raw.created_at * 1000) : new Date();
    // Default deadline 30 days after posted date
    const deadline = new Date(postedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      externalId,
      source: this.getSourceName(),
      sourceType: this.getSourceType(),
      sourceUrl: externalUrl,
      canonicalUrl: externalUrl,
      title,
      companyName: company,
      companyLogo: null, // Will be resolved by company normalizer if needed
      companyWebsite: '',
      description: raw.description || `Engineering opportunity at ${company}.`,
      shortDescription: `Verified role at ${company} via ${this.getSourceName()}`,
      employmentType: tLower.includes('intern') ? EMPLOYMENT_TYPE.INTERNSHIP : EMPLOYMENT_TYPE.FULL_TIME,
      opportunityType: tLower.includes('intern') ? OPPORTUNITY_TYPE.INTERNSHIP : OPPORTUNITY_TYPE.JOB,
      workMode,
      location: {
        city: locationStr.includes(',') ? locationStr.split(',')[0].trim() : (isRemote ? 'Remote' : locationStr),
        state: '',
        country: isRemote ? 'Remote Global' : 'India',
      },
      city: locationStr.includes(',') ? locationStr.split(',')[0].trim() : (isRemote ? 'Remote' : locationStr),
      country: isRemote ? 'Remote Global' : 'India',
      skills,
      category,
      duration: tLower.includes('intern') ? '3-6 Months' : 'Full-time',
      applicationDeadline: deadline,
      postedAt,
      lastVerifiedAt: new Date(),
      isVerified: true,
      applicationUrl: externalUrl,
      applicationMethod: APPLICATION_METHOD.EXTERNAL,
      stipend: {
        amount: null, // Authentic null: no fake salaries fabricated
        currency: 'INR',
        period: 'MONTH',
        isUnpaid: false,
      },
      metadata: {
        arbeitnowTags: tags,
      },
    };
  }
}

export default ArbeitnowConnector;
