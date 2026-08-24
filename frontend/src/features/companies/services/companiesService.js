/**
 * Enterprise Company Intelligence & Dynamic Aggregation Engine.
 * Fetches live company data from MongoDB Atlas via the backend API,
 * then merges with rich local enrichment data (tech stacks, compensation
 * benchmarks, culture ratings, AI innovation scores).
 *
 * Strategy:
 *   - API data (MongoDB Atlas) is the source of truth for company existence.
 *   - Local DETAILED_COMPANY_PROFILES provides extended metadata enrichment.
 *   - Both are merged by slug, preferring API fields where present.
 */

import apiClient from '../../../lib/axios.js';
import { DETAILED_COMPANY_PROFILES } from '../data/companiesData.js';

// ─── Enrichment index (slug → local profile) ─────────────────────────────────
const LOCAL_ENRICHMENT_INDEX = new Map(
  DETAILED_COMPANY_PROFILES.map((p) => [p.slug.toLowerCase(), p])
);

// ─── Logo fallback helper ─────────────────────────────────────────────────────
function resolveLogoUrl(company) {
  if (company.logo && !company.logo.includes('images.unsplash.com')) {
    return company.logo;
  }
  const domain = company.website
    ? company.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    : `${company.slug}.com`;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/**
 * Merge an API company record with local enrichment data.
 * API fields take precedence; enrichment fills in gaps.
 */
function mergeWithEnrichment(apiCompany) {
  const slug = (apiCompany.slug || '').toLowerCase();
  const local = LOCAL_ENRICHMENT_INDEX.get(slug) || {};

  return {
    // Start with local enrichment (ratings, tech stack, compensation, etc.)
    ...local,
    // Overwrite identity fields from the real database
    _id: apiCompany._id,
    id: apiCompany._id,
    name: apiCompany.name || local.name,
    slug: apiCompany.slug || local.slug,
    description: apiCompany.description || local.description,
    website: apiCompany.website || local.website,
    industry: apiCompany.industry || local.industry,
    location: apiCompany.location || local.location,
    companySize: apiCompany.companySize || local.companySize,
    foundedYear: apiCompany.foundedYear || local.foundedYear,
    verified: apiCompany.verified ?? local.verified ?? false,
    openRolesCount: apiCompany.openRolesCount ?? local.openRolesCount ?? 0,
    // Resolve logo from API, local profile, or favicon fallback
    logo: resolveLogoUrl({
      logo: apiCompany.logo || local.logo,
      website: apiCompany.website || local.website,
      slug: apiCompany.slug || local.slug,
    }),
    // Active internships from API
    activeInternships: apiCompany.activeInternships || [],
    hasActiveRoles: (apiCompany.openRolesCount ?? 0) > 0,
    // Source tracking
    _fromDatabase: true,
  };
}

// ─── In-memory API response cache (1 minute TTL) ─────────────────────────────
let _cachedApiCompanies = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

/**
 * Fetches all companies from MongoDB Atlas via the backend API.
 * Falls back to local enrichment data if the request fails.
 */
export async function fetchCompaniesFromAPI(forceRefresh = false) {
  const now = Date.now();
  if (_cachedApiCompanies && !forceRefresh && now - _cacheTimestamp < CACHE_TTL_MS) {
    return _cachedApiCompanies;
  }

  try {
    // Fetch a large batch so we can do client-side filtering
    const response = await apiClient.get('/companies', {
      params: { limit: 200, verifiedOnly: 'false' },
    });

    const apiList = response.data?.data?.data || [];
    const merged = apiList.map(mergeWithEnrichment);

    // Also include local-only profiles (not yet in DB) for completeness
    const apiSlugs = new Set(merged.map((c) => (c.slug || '').toLowerCase()));
    const localOnly = DETAILED_COMPANY_PROFILES
      .filter((p) => !apiSlugs.has(p.slug.toLowerCase()))
      .map((p) => ({
        ...p,
        id: p.id || p.slug,
        openRolesCount: p.openRolesCount || 0,
        activeInternships: [],
        logo: resolveLogoUrl(p),
        _fromDatabase: false,
      }));

    _cachedApiCompanies = [...merged, ...localOnly];
    _cacheTimestamp = now;
    return _cachedApiCompanies;
  } catch (err) {
    console.warn('[companiesService] API unavailable, falling back to local data:', err.message);

    // Return local enrichment data only
    return DETAILED_COMPANY_PROFILES.map((p) => ({
      ...p,
      id: p.id || p.slug,
      openRolesCount: p.openRolesCount || 0,
      activeInternships: [],
      logo: resolveLogoUrl(p),
      _fromDatabase: false,
    }));
  }
}

/**
 * Returns enriched companies. Used by CompaniesPage via React state (async).
 * This replaces the old synchronous `getAllEnrichedCompanies()`.
 */
export async function getAllEnrichedCompaniesAsync(forceRefresh = false) {
  return fetchCompaniesFromAPI(forceRefresh);
}

/**
 * Synchronous fallback — returns the local enrichment data.
 * Used by components that need immediate data (before async fetch completes).
 */
export function getAllEnrichedCompanies() {
  // If we have cached API data, return it synchronously
  if (_cachedApiCompanies && Date.now() - _cacheTimestamp < CACHE_TTL_MS) {
    return _cachedApiCompanies;
  }
  // Cold start — return local only
  return DETAILED_COMPANY_PROFILES.map((p) => ({
    ...p,
    id: p.id || p.slug,
    openRolesCount: p.openRolesCount || 0,
    activeInternships: [],
    logo: resolveLogoUrl(p),
    _fromDatabase: false,
  }));
}

// ─── Logo fallback mapper ─────────────────────────────────────────────────────
function getCleanCompanyLogo(company) {
  return resolveLogoUrl(company);
}

// ─── AI Match Score ───────────────────────────────────────────────────────────
/**
 * Computes AI Match Compatibility Score (0-100%) based on candidate skills.
 */
export function calculateAISmartMatch(company, userSkills = []) {
  if (!userSkills || userSkills.length === 0) return null;

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());
  const companyTech = (company.techStack || []).map((t) => t.toLowerCase());

  const internshipSkills = new Set();
  (company.activeInternships || []).forEach((job) => {
    (job.skills || []).forEach((s) => internshipSkills.add(s.toLowerCase()));
  });

  const allCompanySkills = new Set([...companyTech, ...internshipSkills]);

  let matchedCount = 0;
  const matchedSkills = [];

  for (const skill of normalizedUserSkills) {
    if (
      allCompanySkills.has(skill) ||
      [...allCompanySkills].some((cs) => cs.includes(skill) || skill.includes(cs))
    ) {
      matchedCount++;
      matchedSkills.push(skill);
    }
  }

  if (matchedCount === 0) return null;

  const matchRatio = matchedCount / Math.max(1, normalizedUserSkills.length);
  const rawScore = Math.round(
    55 +
      matchRatio * 40 +
      (company.aiInnovationIndex ? (company.aiInnovationIndex - 90) * 0.5 : 0)
  );
  const finalScore = Math.min(99, Math.max(65, rawScore));

  return {
    score: finalScore,
    matchedSkills,
    matchCount: matchedCount,
    totalSkillsChecked: normalizedUserSkills.length,
  };
}

// ─── Query / Filter / Sort / Paginate ────────────────────────────────────────
/**
 * Filter, search, sort, and paginate companies.
 * Operates on a pre-fetched list passed in as `allCompanies`.
 */
export function queryCompanies(params = {}, userSkills = [], savedCompanyIds = new Set(), allCompanies = null) {
  let list = [...(allCompanies || getAllEnrichedCompanies())];

  // 1. Search Query
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((c) => {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const indMatch = (c.industry || '').toLowerCase().includes(q);
      const catMatch = (c.category || '').toLowerCase().includes(q);
      const descMatch = (c.description || '').toLowerCase().includes(q);
      const tagMatch = (c.tagline || '').toLowerCase().includes(q);
      const techMatch = (c.techStack || []).some((t) => t.toLowerCase().includes(q));
      const locCityMatch = (c.location?.city || '').toLowerCase().includes(q);
      const locCountryMatch = (c.location?.country || '').toLowerCase().includes(q);
      const roleMatch = (c.activeInternships || []).some((job) =>
        (job.title || '').toLowerCase().includes(q)
      );
      return (
        nameMatch || indMatch || catMatch || descMatch || tagMatch ||
        techMatch || locCityMatch || locCountryMatch || roleMatch
      );
    });
  }

  // 2. Category / Sector Filter
  if (params.category && params.category !== 'ALL' && params.category !== 'all') {
    list = list.filter(
      (c) => c.category === params.category || c.sector === params.category ||
        (c.industry || '').toLowerCase().includes(params.category.toLowerCase())
    );
  }

  // 3. Company Size Filter
  if (params.size && params.size !== 'ALL' && params.size !== 'all') {
    if (params.size === 'STARTUP') {
      list = list.filter((c) => {
        const s = parseInt((c.companySize || '0').replace(/[^0-9]/g, ''), 10);
        return s <= 100 || (c.companySize || '').includes('50') || (c.companySize || '').includes('80');
      });
    } else if (params.size === 'MID_SIZE') {
      list = list.filter((c) => {
        const s = parseInt((c.companySize || '0').replace(/[^0-9]/g, ''), 10);
        return s > 100 && s <= 1000;
      });
    } else if (params.size === 'ENTERPRISE') {
      list = list.filter((c) => {
        const s = parseInt((c.companySize || '0').replace(/[^0-9]/g, ''), 10);
        return s > 1000 && s <= 10000;
      });
    } else if (params.size === 'TECH_GIANT') {
      list = list.filter((c) => {
        const s = parseInt((c.companySize || '0').replace(/[^0-9]/g, ''), 10);
        return (
          s >= 10000 ||
          (c.companySize || '').includes('10,000') ||
          (c.companySize || '').includes('30,000') ||
          (c.companySize || '').includes('180,000')
        );
      });
    }
  }

  // 4. Work Policy Filter
  if (params.workPolicy && params.workPolicy !== 'ALL' && params.workPolicy !== 'all') {
    list = list.filter((c) => c.workPolicy === params.workPolicy);
  }

  // 5. Minimum Monthly Stipend Filter
  if (params.minStipend) {
    const min = Number(params.minStipend);
    if (!isNaN(min) && min > 0) {
      list = list.filter(
        (c) => (c.compensation?.maxMonthlyStipend || c.compensation?.avgMonthlyStipend || 0) >= min
      );
    }
  }

  // 6. Minimum Rating Filter
  if (params.minRating) {
    const minR = Number(params.minRating);
    if (!isNaN(minR) && minR > 0) {
      list = list.filter((c) => (c.ratings?.overall || 0) >= minR);
    }
  }

  // 7. Only Actively Hiring Filter
  if (params.hiringOnly === true || params.hiringOnly === 'true') {
    list = list.filter((c) => (c.openRolesCount || 0) > 0);
  }

  // 8. Tech Stack Filter
  if (params.tech && params.tech.trim()) {
    const reqSkills = params.tech
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (reqSkills.length > 0) {
      list = list.filter((c) => {
        const cTech = (c.techStack || []).map((t) => t.toLowerCase());
        return reqSkills.some((req) =>
          cTech.some((ct) => ct.includes(req) || req.includes(ct))
        );
      });
    }
  }

  // 9. AI Smart Match
  if (userSkills && userSkills.length > 0) {
    list = list.map((c) => ({
      ...c,
      aiMatch: calculateAISmartMatch(c, userSkills),
      isSaved: savedCompanyIds.has(c.id) || savedCompanyIds.has(c.slug),
    }));
  } else {
    list = list.map((c) => ({
      ...c,
      isSaved: savedCompanyIds.has(c.id) || savedCompanyIds.has(c.slug),
    }));
  }

  // 10. Sorting
  const sortBy = params.sortBy || 'most_roles';
  if (sortBy === 'most_roles') {
    list.sort(
      (a, b) =>
        (b.openRolesCount || 0) - (a.openRolesCount || 0) ||
        (b.ratings?.overall || 0) - (a.ratings?.overall || 0)
    );
  } else if (sortBy === 'stipend_high') {
    list.sort(
      (a, b) =>
        (b.compensation?.maxMonthlyStipend || 0) - (a.compensation?.maxMonthlyStipend || 0)
    );
  } else if (sortBy === 'rating_high') {
    list.sort((a, b) => (b.ratings?.overall || 0) - (a.ratings?.overall || 0));
  } else if (sortBy === 'ai_match' && userSkills.length > 0) {
    list.sort((a, b) => (b.aiMatch?.score || 0) - (a.aiMatch?.score || 0));
  } else if (sortBy === 'ai_innovation') {
    list.sort((a, b) => (b.aiInnovationIndex || 0) - (a.aiInnovationIndex || 0));
  } else if (sortBy === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => (b.openRolesCount || 0) - (a.openRolesCount || 0));
  }

  const total = list.length;
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.max(1, parseInt(params.limit, 10) || 12);
  const skip = (page - 1) * limit;

  return {
    data: list.slice(skip, skip + limit),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Fetches a single company by slug from the API, merged with local enrichment.
 * Falls back to local data if API is unavailable.
 */
export async function getCompanyBySlugAsync(slugOrId, userSkills = []) {
  if (!slugOrId) return null;
  const clean = String(slugOrId).toLowerCase().trim();

  try {
    const response = await apiClient.get(`/companies/${clean}`);
    const apiData = response.data?.data;
    if (apiData) {
      const merged = mergeWithEnrichment(apiData);
      const aiMatch = userSkills.length > 0 ? calculateAISmartMatch(merged, userSkills) : null;
      const allCompanies = getAllEnrichedCompanies();
      const similarCompanies = getSimilarCompanies(merged, 4, allCompanies);
      return { ...merged, aiMatch, similarCompanies };
    }
  } catch (err) {
    console.warn('[companiesService] Company detail API failed, falling back to local:', err.message);
  }

  // Local fallback
  return getCompanyBySlugOrId(slugOrId, userSkills);
}

/**
 * Synchronous lookup (local data only).
 */
export function getCompanyBySlugOrId(slugOrId, userSkills = []) {
  if (!slugOrId) return null;
  const list = getAllEnrichedCompanies();
  const clean = String(slugOrId).toLowerCase().trim();

  const found = list.find(
    (c) =>
      (c.slug || '').toLowerCase() === clean ||
      (c.id || '').toLowerCase() === clean ||
      (c.name || '').toLowerCase() === clean
  );
  if (!found) return null;

  const aiMatch = userSkills.length > 0 ? calculateAISmartMatch(found, userSkills) : null;
  const similarCompanies = getSimilarCompanies(found, 4, list);
  return { ...found, aiMatch, similarCompanies };
}

/**
 * Recommends similar companies based on category, tech stack, and compensation.
 */
export function getSimilarCompanies(targetCompany, limit = 4, allCompanies = null) {
  if (!targetCompany) return [];
  const list = allCompanies || getAllEnrichedCompanies();

  return list
    .filter((c) => c.slug !== targetCompany.slug && c.id !== targetCompany.id)
    .map((c) => {
      let similarityScore = 0;
      if (c.category === targetCompany.category) similarityScore += 40;
      if (c.workPolicy === targetCompany.workPolicy) similarityScore += 15;
      const commonTech = (c.techStack || []).filter((t) =>
        (targetCompany.techStack || []).includes(t)
      );
      similarityScore += commonTech.length * 8;
      return { company: c, similarityScore };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map((item) => item.company);
}

/**
 * Aggregates high-level platform statistics.
 */
export function getPlatformCompanyStats(allCompanies = null) {
  const all = allCompanies || getAllEnrichedCompanies();
  const totalCompanies = all.length;
  const activeRolesTotal = all.reduce((sum, c) => sum + (c.openRolesCount || 0), 0);

  const validStipends = all
    .map((c) => c.compensation?.avgMonthlyStipend)
    .filter((s) => typeof s === 'number' && s > 0);
  const avgMonthlyStipend =
    validStipends.length > 0
      ? Math.round(validStipends.reduce((a, b) => a + b, 0) / validStipends.length)
      : 9250;

  const avgReturnOfferRate = Math.round(
    all.reduce((sum, c) => sum + (c.ratings?.returnOfferRate || 85), 0) /
      Math.max(1, totalCompanies)
  );

  return {
    totalCompanies,
    activeRolesTotal,
    avgMonthlyStipend,
    avgReturnOfferRate,
    topAiLabsCount: all.filter((c) => c.category === 'AI & Machine Learning').length,
    tier1Count: all.filter((c) => (c.compensation?.maxMonthlyStipend || 0) >= 10000).length,
  };
}
