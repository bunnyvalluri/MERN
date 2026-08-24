import mongoose from 'mongoose';
import { Company } from '../models/Company.model.js';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { ApiError } from '../utils/ApiError.js';

export class CompanyService {
  /**
   * Returns paginated, searchable list of public companies.
   */
  static async getCompanies(queryParams = {}) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
    }

    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Only show verified companies in the public list (non-verified are recruiter-created placeholders)
    if (queryParams.verifiedOnly !== 'false') {
      filter.verified = true;
    }

    if (queryParams.industry && queryParams.industry !== 'ALL') {
      filter.industry = new RegExp(queryParams.industry.trim(), 'i');
    }

    if (queryParams.search && queryParams.search.trim()) {
      const searchRegex = new RegExp(queryParams.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { industry: searchRegex },
        { 'location.city': searchRegex },
      ];
    }

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .select('_id name slug logo description website industry location companySize foundedYear verified createdAt')
        .sort({ verified: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    // Enrich with active internship counts
    const companyIds = companies.map((c) => c._id);
    const countsAgg = await Internship.aggregate([
      {
        $match: {
          companyId: { $in: companyIds },
          status: INTERNSHIP_STATUS.PUBLISHED,
          isActive: true,
          applicationDeadline: { $gte: new Date() },
        },
      },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);
    const countsMap = new Map(countsAgg.map((item) => [item._id.toString(), item.count]));

    const enriched = companies.map((c) => ({
      ...c,
      openRolesCount: countsMap.get(c._id.toString()) || 0,
      // Derive logo URL from website domain if logo is missing
      logo: c.logo || (c.website
        ? `https://www.google.com/s2/favicons?domain=${c.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}&sz=128`
        : null),
    }));

    return {
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Returns a single company profile by slug or ID, with its active internships.
   */
  static async getCompanyBySlug(slugOrId) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
    const query = isObjectId ? { _id: slugOrId } : { slug: slugOrId.toLowerCase() };

    const company = await Company.findOne(query)
      .populate('ownerId', 'name email')
      .lean();

    if (!company) {
      throw new ApiError(404, 'Company not found.');
    }

    // Fetch active internships for this company
    const activeInternships = await Internship.find({
      companyId: company._id,
      status: INTERNSHIP_STATUS.PUBLISHED,
      isActive: true,
      applicationDeadline: { $gte: new Date() },
    })
      .select('_id title slug category workMode location stipend skills applicationDeadline postedAt')
      .sort({ postedAt: -1 })
      .limit(20)
      .lean();

    return {
      ...company,
      logo: company.logo || (company.website
        ? `https://www.google.com/s2/favicons?domain=${company.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}&sz=128`
        : null),
      openRolesCount: activeInternships.length,
      activeInternships,
    };
  }

  /**
   * Returns distinct industry list for filtering.
   */
  static getIndustries() {
    if (mongoose.connection.readyState !== 1) {
      return Promise.resolve([]);
    }
    return Company.distinct('industry');
  }
}

export default CompanyService;
