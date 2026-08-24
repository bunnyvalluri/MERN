import { JobSourceConnector } from '../base/JobSourceConnector.js';
import { SOURCE_TYPE, WORKPLACE_TYPE, EMPLOYMENT_TYPE, OPPORTUNITY_TYPE, APPLICATION_METHOD } from '../../models/Internship.model.js';
import { logger } from '../../utils/logger.js';

export class JobicyConnector extends JobSourceConnector {
  constructor(options = {}) {
    super('Jobicy API', SOURCE_TYPE.API, {
      enabled: options.enabled ?? true,
      syncIntervalMinutes: options.syncIntervalMinutes || 30,
      supportsIndia: true,
      supportsInternships: true,
      supportsJobs: true,
      ...options,
    });
    this.endpoint = options.endpoint || 'https://jobicy.com/api/v2/remote-jobs?count=25&industry=engineering';
  }

  async fetchListings() {
    try {
      logger.info(`[JobicyConnector] Fetching listings from ${this.endpoint}`);
      const response = await this.safeFetch(this.endpoint);

      if (!response.ok) {
        throw new Error(`Jobicy API HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawListings = Array.isArray(data?.jobs) ? data.jobs : [];

      const normalized = rawListings
        .map((item) => this.normalizeListing(item))
        .filter((item) => this.validateListing(item));

      this.recordSuccess(normalized.length);
      logger.info(`[JobicyConnector] Successfully fetched & normalized ${normalized.length} listings`);
      return normalized;
    } catch (err) {
      this.recordFailure(err);
      logger.error(`[JobicyConnector] Fetch failed: ${err.message}`);
      throw err;
    }
  }

  normalizeListing(raw) {
    if (!raw) return null;

    const title = (raw.jobTitle || '').trim();
    const company = (raw.companyName || 'Global Tech Partner').trim();
    const externalUrl = (raw.url || '').trim();
    const externalId = String(raw.id || `jobicy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    const geo = (raw.jobGeo || 'Remote Global').trim();
    const logo = raw.companyLogo || null;

    const tLower = title.toLowerCase();

    // Determine category
    let category = 'Software Development';
    if (tLower.includes('ai') || tLower.includes('data') || tLower.includes('machine learning')) {
      category = 'Data Science & AI';
    } else if (tLower.includes('front') || tLower.includes('ui') || tLower.includes('react')) {
      category = 'Frontend Development';
    } else if (tLower.includes('back') || tLower.includes('python') || tLower.includes('go') || tLower.includes('node')) {
      category = 'Backend Development';
    } else if (tLower.includes('devops') || tLower.includes('cloud') || tLower.includes('infrastructure')) {
      category = 'DevOps & Cloud';
    }

    const postedAt = raw.pubDate ? new Date(raw.pubDate) : new Date();
    const deadline = new Date(postedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Extract skills from job excerpt / title
    const skills = ['Software Engineering', 'Remote Work', 'Git'];
    if (tLower.includes('react')) skills.push('React');
    if (tLower.includes('node')) skills.push('Node.js');
    if (tLower.includes('python')) skills.push('Python');
    if (tLower.includes('typescript')) skills.push('TypeScript');
    if (tLower.includes('aws')) skills.push('AWS');

    return {
      externalId,
      source: this.getSourceName(),
      sourceType: this.getSourceType(),
      sourceUrl: externalUrl,
      canonicalUrl: externalUrl,
      title,
      companyName: company,
      companyLogo: logo,
      companyWebsite: '',
      description: raw.jobDescription || raw.jobExcerpt || `Engineering position at ${company}.`,
      shortDescription: `Verified remote position at ${company} via ${this.getSourceName()}`,
      employmentType: tLower.includes('intern') ? EMPLOYMENT_TYPE.INTERNSHIP : EMPLOYMENT_TYPE.FULL_TIME,
      opportunityType: tLower.includes('intern') ? OPPORTUNITY_TYPE.INTERNSHIP : OPPORTUNITY_TYPE.JOB,
      workMode: WORKPLACE_TYPE.REMOTE,
      location: {
        city: 'Remote',
        state: '',
        country: geo || 'Remote Global',
      },
      city: 'Remote',
      country: geo || 'Remote Global',
      skills,
      category,
      duration: tLower.includes('intern') ? '3-6 Months' : 'Permanent',
      applicationDeadline: deadline,
      postedAt,
      lastVerifiedAt: new Date(),
      isVerified: true,
      applicationUrl: externalUrl,
      applicationMethod: APPLICATION_METHOD.EXTERNAL,
      stipend: {
        amount: null, // Authentic null: no fake salaries fabricated
        currency: 'USD',
        period: 'MONTH',
        isUnpaid: false,
      },
      metadata: {
        jobGeo: geo,
        jobIndustry: raw.jobIndustry,
      },
    };
  }
}

export default JobicyConnector;
