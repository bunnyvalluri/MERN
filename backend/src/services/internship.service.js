import mongoose from 'mongoose';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { SavedInternship } from '../models/SavedInternship.model.js';
import { Application } from '../models/Application.model.js';
import { SyncJob } from '../models/SyncJob.model.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export class InternshipService {
  /**
   * Retrieves paginated, filtered, and sorted internships directly from MongoDB.
   */
  static async getInternships(queryParams = {}, studentId = null) {
    if (mongoose.connection.readyState !== 1) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
        },
        filters: queryParams,
        lastSyncedAt: new Date().toISOString(),
      };
    }

    try {
      const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 12));
      const skip = (page - 1) * limit;

      // 1. Build Query Filter
      const filter = {
        status: INTERNSHIP_STATUS.PUBLISHED,
        isActive: true,
        applicationDeadline: { $gte: new Date() },
      };

      // 2. Keyword Search (title, companyName, skills, description, category, city)
      if (queryParams.search && queryParams.search.trim()) {
        const searchTerms = queryParams.search.trim();
        const searchRegex = new RegExp(searchTerms.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        filter.$or = [
          { title: searchRegex },
          { companyName: searchRegex },
          { skills: { $in: [searchRegex] } },
          { category: searchRegex },
          { 'location.city': searchRegex },
          { city: searchRegex },
          { description: searchRegex },
        ];
      }

      // 3. Location Filter (City, State, Country, locations array)
      if (queryParams.location && queryParams.location.trim()) {
        const locTerm = queryParams.location.trim();
        const locRegex = new RegExp(locTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        const locOr = [
          { 'location.city': locRegex },
          { 'location.state': locRegex },
          { 'location.country': locRegex },
          { city: locRegex },
          { country: locRegex },
          { locations: { $in: [locRegex] } },
        ];

        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: locOr }];
          delete filter.$or;
        } else {
          filter.$or = locOr;
        }
      }

      // 4. Work Mode / Remote Filter
      const workMode = queryParams.workMode || queryParams.remote;
      if (workMode && workMode !== 'ALL' && workMode !== 'all') {
        const mode = workMode.toUpperCase();
        filter.$or = filter.$or
          ? [{ $or: filter.$or }, { workMode: mode }, { remote: mode }]
          : [{ workMode: mode }, { remote: mode }];
      }

      // 5. Employment Type / Opportunity Type
      const empType = queryParams.employmentType || queryParams.type;
      if (empType && empType !== 'ALL' && empType !== 'all') {
        filter.employmentType = empType.toUpperCase();
      }

      if (queryParams.opportunityType && queryParams.opportunityType !== 'ALL') {
        filter.opportunityType = queryParams.opportunityType.toUpperCase();
      }

      // 6. Category / Domain Filter
      if (queryParams.category && queryParams.category !== 'ALL' && queryParams.category !== 'all') {
        const catTerm = queryParams.category.trim();
        const catRegex = new RegExp(catTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const catOr = [
          { category: catRegex },
          { subCategory: catRegex },
          { title: catRegex },
          { skills: { $in: [catRegex] } },
        ];

        if (filter.$and) {
          filter.$and.push({ $or: catOr });
        } else if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: catOr }];
          delete filter.$or;
        } else {
          filter.$or = catOr;
        }
      }

      // 7. Stipend Range Filter
      const minStipend = queryParams.stipendMin !== undefined && queryParams.stipendMin !== ''
        ? queryParams.stipendMin
        : queryParams.minStipend;
      const maxStipend = queryParams.stipendMax !== undefined && queryParams.stipendMax !== ''
        ? queryParams.stipendMax
        : queryParams.maxStipend;

      if ((minStipend !== undefined && minStipend !== '') || (maxStipend !== undefined && maxStipend !== '')) {
        filter['stipend.amount'] = {};
        if (minStipend !== undefined && minStipend !== '') {
          filter['stipend.amount'].$gte = Number(minStipend);
        }
        if (maxStipend !== undefined && maxStipend !== '') {
          filter['stipend.amount'].$lte = Number(maxStipend);
        }
      }

      // 8. Skills Filter
      if (queryParams.skills && queryParams.skills.trim()) {
        const skillTags = queryParams.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => new RegExp(`^${s}$`, 'i'));

        if (skillTags.length > 0) {
          filter.skills = { $in: skillTags };
        }
      }

      // 9. Company Filter
      if (queryParams.company && queryParams.company.trim()) {
        const compRegex = new RegExp(queryParams.company.trim(), 'i');
        filter.$or = filter.$or
          ? filter.$or.concat([{ companyName: compRegex }])
          : [{ companyName: compRegex }];
      }

      // 10. Date Posted / Posted Within Filter
      const datePosted = queryParams.postedWithin || queryParams.datePosted;
      if (datePosted && datePosted !== 'all') {
        const now = Date.now();
        const mapDays = {
          today: 1,
          '24h': 1,
          past_week: 7,
          '7d': 7,
          '14d': 14,
          past_month: 30,
          '30d': 30,
        };
        const days = mapDays[datePosted] || 30;
        const cutoffDate = new Date(now - days * 24 * 60 * 60 * 1000);
        filter.postedAt = { $gte: cutoffDate };
      }

      // 11. Sorting Order
      const sortKey = queryParams.sortBy || queryParams.sort || 'latest';
      let sort = { postedAt: -1, createdAt: -1 };

      if (sortKey === 'deadline') {
        sort = { applicationDeadline: 1 };
      } else if (sortKey === 'stipend_high') {
        sort = { 'stipend.amount': -1, postedAt: -1 };
      } else if (sortKey === 'stipend_low') {
        sort = { 'stipend.amount': 1, postedAt: -1 };
      } else if (sortKey === 'popularity') {
        sort = { viewsCount: -1, applicationsCount: -1, postedAt: -1 };
      } else if (sortKey === 'newest') {
        sort = { postedAt: -1 };
      }

      // 12. Execute DB Queries
      const [internships, total, latestSyncJob] = await Promise.all([
        Internship.find(filter)
          .populate('companyId', '_id name slug logo location website industry verified')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Internship.countDocuments(filter),
        SyncJob.findOne({ status: 'SUCCESS' }).sort({ completedAt: -1 }).select('completedAt'),
      ]);

      // 13. Student Saved Status Lookup
      let savedMap = new Set();
      if (studentId && internships.length > 0) {
        const internshipIds = internships.map((i) => i._id);
        const savedDocs = await SavedInternship.find({
          studentId,
          internshipId: { $in: internshipIds },
        }).select('internshipId');

        savedMap = new Set(savedDocs.map((s) => s.internshipId.toString()));
      }

      const data = internships.map((item) => {
        const comp = item.companyId || {};
        const realName = comp.name || (item.companyName !== 'Partner Employer' ? item.companyName : '') || 'Top Tier Employer';
        const realLogo = comp.logo || item.companyLogo || `https://www.google.com/s2/favicons?domain=${comp.slug || 'google'}.com&sz=128`;
        const realWebsite = comp.website || item.companyWebsite || (comp.slug ? `https://${comp.slug}.com` : '');

        return {
          ...item,
          companyName: realName,
          companyLogo: realLogo,
          companyWebsite: realWebsite,
          isSaved: savedMap.has(item._id.toString()),
        };
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
        filters: queryParams,
        lastSyncedAt: latestSyncJob?.completedAt || new Date().toISOString(),
      };
    } catch (err) {
      logger.error(`[InternshipService] Database query error: ${err.message}`);
      throw new ApiError(500, `Failed to retrieve internships: ${err.message}`);
    }
  }

  /**
   * Retrieves single internship details by ID or slug.
   */
  static async getInternshipById(idOrSlug, studentId = null) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(404, 'Internship opportunity not found.');
    }

    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

      const internship = await Internship.findOne(query)
        .populate('companyId', '_id name slug logo description location website industry companySize foundedYear verified')
        .populate('createdBy', '_id name email');

      if (!internship) {
        throw new ApiError(404, 'Internship opportunity not found.');
      }

      // Increment view count asynchronously
      Internship.findByIdAndUpdate(internship._id, {
        $inc: { viewsCount: 1, viewCount: 1 },
      }).catch(() => {});

      let isSaved = false;
      let hasApplied = false;

      if (studentId) {
        const [savedDoc, appDoc] = await Promise.all([
          SavedInternship.findOne({ studentId, internshipId: internship._id }),
          Application.findOne({ studentId, internshipId: internship._id }).select('_id status createdAt'),
        ]);
        isSaved = Boolean(savedDoc);
        hasApplied = Boolean(appDoc);
      }

      return {
        internship,
        isSaved,
        hasApplied,
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(404, 'Internship opportunity not found.');
    }
  }

  /**
   * Toggles save / bookmark status for an internship in MongoDB.
   */
  static async toggleSaveInternship(studentId, internshipId) {
    try {
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        throw new ApiError(404, 'Internship not found.');
      }

      const existingSave = await SavedInternship.findOne({ studentId, internshipId });

      if (existingSave) {
        await SavedInternship.findByIdAndDelete(existingSave._id);
        return { isSaved: false, message: 'Internship removed from saved list.' };
      }

      await SavedInternship.create({ studentId, internshipId });
      return { isSaved: true, message: 'Internship saved to your bookmarks.' };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, `Failed to update bookmark: ${err.message}`);
    }
  }

  /**
   * Retrieves paginated saved internships for a student from MongoDB.
   */
  static async getSavedInternships(studentId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 12));
    const skip = (page - 1) * limit;

    try {
      const [savedRecords, total] = await Promise.all([
        SavedInternship.find({ studentId })
          .populate({
            path: 'internshipId',
            populate: { path: 'companyId', select: 'name slug logo location industry verified' },
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        SavedInternship.countDocuments({ studentId }),
      ]);

      const data = savedRecords
        .filter((r) => r.internshipId)
        .map((r) => ({
          ...r.internshipId,
          isSaved: true,
          savedAt: r.createdAt,
        }));

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (err) {
      throw new ApiError(500, `Failed to retrieve saved bookmarks: ${err.message}`);
    }
  }
}

export default InternshipService;
