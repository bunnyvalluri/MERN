import { JobSourceConnector } from '../base/JobSourceConnector.js';
import { SOURCE_TYPE, WORKPLACE_TYPE, EMPLOYMENT_TYPE, OPPORTUNITY_TYPE, APPLICATION_METHOD } from '../../models/Internship.model.js';
import { logger } from '../../utils/logger.js';

/**
 * Connects to public Greenhouse job board endpoints for authorized companies
 * (e.g. https://boards-api.greenhouse.io/v1/boards/{company}/jobs)
 */
export class GreenhousePublicConnector extends JobSourceConnector {
  constructor(options = {}) {
    super('Greenhouse ATS', SOURCE_TYPE.ATS, {
      enabled: options.enabled ?? true,
      syncIntervalMinutes: options.syncIntervalMinutes || 60,
      supportsIndia: true,
      supportsInternships: true,
      supportsJobs: true,
      ...options,
    });
    // Public career boards for partner tech companies
    this.targetBoards = options.targetBoards || [
      { slug: 'gitlab', name: 'GitLab' },
      { slug: 'automattic', name: 'Automattic' },
    ];
  }

  async fetchListings() {
    const allNormalized = [];

    for (const board of this.targetBoards) {
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`;
        logger.info(`[GreenhouseConnector] Fetching board for ${board.name} at ${url}`);
        const response = await this.safeFetch(url);

        if (!response.ok) {
          logger.warn(`[GreenhouseConnector] Board ${board.slug} returned status ${response.status}`);
          continue;
        }

        const data = await response.json();
        const rawJobs = Array.isArray(data?.jobs) ? data.jobs : [];

        const normalized = rawJobs
          .filter((j) => {
            const t = (j.title || '').toLowerCase();
            return (
              t.includes('intern') ||
              t.includes('software') ||
              t.includes('engineer') ||
              t.includes('developer') ||
              t.includes('frontend') ||
              t.includes('backend')
            );
          })
          .map((j) => this.normalizeListing(j, board))
          .filter((j) => this.validateListing(j));

        allNormalized.push(...normalized);
      } catch (err) {
        logger.warn(`[GreenhouseConnector] Failed board fetch for ${board.slug}: ${err.message}`);
      }
    }

    this.recordSuccess(allNormalized.length);
    return allNormalized;
  }

  normalizeListing(raw, board) {
    if (!raw) return null;

    const title = (raw.title || '').trim();
    const company = (board?.name || 'Technology Company').trim();
    const externalId = `gh-${board?.slug || 'board'}-${raw.id}`;
    const externalUrl = (raw.absolute_url || '').trim();
    const locationName = (raw.location?.name || 'Remote').trim();
    const isRemote = locationName.toLowerCase().includes('remote');

    const tLower = title.toLowerCase();
    let category = 'Software Development';
    if (tLower.includes('ai') || tLower.includes('data')) category = 'Data Science & AI';
    else if (tLower.includes('front') || tLower.includes('react')) category = 'Frontend Development';
    else if (tLower.includes('back') || tLower.includes('systems')) category = 'Backend Development';
    else if (tLower.includes('cloud') || tLower.includes('devops')) category = 'DevOps & Cloud';

    const postedAt = raw.updated_at ? new Date(raw.updated_at) : new Date();
    const deadline = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

    return {
      externalId,
      source: this.getSourceName(),
      sourceType: this.getSourceType(),
      sourceUrl: externalUrl,
      canonicalUrl: externalUrl,
      title,
      companyName: company,
      companyLogo: null,
      companyWebsite: `https://${board?.slug}.com`,
      description: raw.content || `Engineering opportunity at ${company}.`,
      shortDescription: `Verified opportunity at ${company} via Greenhouse Job Board`,
      employmentType: tLower.includes('intern') ? EMPLOYMENT_TYPE.INTERNSHIP : EMPLOYMENT_TYPE.FULL_TIME,
      opportunityType: tLower.includes('intern') ? OPPORTUNITY_TYPE.INTERNSHIP : OPPORTUNITY_TYPE.JOB,
      workMode: isRemote ? WORKPLACE_TYPE.REMOTE : WORKPLACE_TYPE.HYBRID,
      location: {
        city: isRemote ? 'Remote' : locationName,
        state: '',
        country: isRemote ? 'Remote Global' : 'India / Global',
      },
      city: isRemote ? 'Remote' : locationName,
      country: isRemote ? 'Remote Global' : 'India / Global',
      skills: ['Software Engineering', 'System Architecture', 'Git', 'Agile'],
      category,
      duration: tLower.includes('intern') ? '3-6 Months' : 'Full-Time',
      applicationDeadline: deadline,
      postedAt,
      lastVerifiedAt: new Date(),
      isVerified: true,
      applicationUrl: externalUrl,
      applicationMethod: APPLICATION_METHOD.EXTERNAL,
      stipend: {
        amount: null,
        currency: 'USD',
        period: 'MONTH',
        isUnpaid: false,
      },
      metadata: {
        greenhouseId: raw.id,
        boardSlug: board?.slug,
      },
    };
  }
}

export default GreenhousePublicConnector;
