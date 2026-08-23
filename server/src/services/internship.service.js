import mongoose from 'mongoose';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { SavedInternship } from '../models/SavedInternship.model.js';
import { Application } from '../models/Application.model.js';
import { Company } from '../models/Company.model.js';
import { ApiError } from '../utils/ApiError.js';

export class InternshipService {
  /**
   * Retrieves paginated, filtered, and sorted internships.
   */
  static async getInternships(queryParams = {}, studentId = null) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 12));
    const skip = (page - 1) * limit;

    // 1. Build Query Filter
    const filter = {
      status: INTERNSHIP_STATUS.PUBLISHED,
      applicationDeadline: { $gte: new Date() }, // Only show open non-expired listings
    };

    // Keyword search (title, description, skills)
    if (queryParams.search && queryParams.search.trim()) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skills: { $in: [searchRegex] } },
      ];
    }

    // Location filter (City, State, Country)
    if (queryParams.location && queryParams.location.trim()) {
      const locRegex = new RegExp(queryParams.location.trim(), 'i');
      filter.$or = filter.$or
        ? filter.$or.concat([
            { 'location.city': locRegex },
            { 'location.state': locRegex },
            { 'location.country': locRegex },
          ])
        : [
            { 'location.city': locRegex },
            { 'location.state': locRegex },
            { 'location.country': locRegex },
          ];
    }

    // Remote status filter
    if (queryParams.remote && queryParams.remote !== 'ALL') {
      filter.remote = queryParams.remote;
    }

    // Employment type filter
    if (queryParams.type && queryParams.type !== 'ALL') {
      filter.type = queryParams.type;
    }

    // Category filter
    if (queryParams.category && queryParams.category.trim()) {
      filter.category = new RegExp(queryParams.category.trim(), 'i');
    }

    // Stipend Range Filter
    if (queryParams.minStipend !== undefined || queryParams.maxStipend !== undefined) {
      filter['stipend.amount'] = {};
      if (queryParams.minStipend !== undefined) {
        filter['stipend.amount'].$gte = Number(queryParams.minStipend);
      }
      if (queryParams.maxStipend !== undefined) {
        filter['stipend.amount'].$lte = Number(queryParams.maxStipend);
      }
    }

    // Skills filter (comma-separated or single)
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

    // Company filter (by name or slug)
    if (queryParams.company && queryParams.company.trim()) {
      const matchingCompanies = await Company.find({
        $or: [
          { name: new RegExp(queryParams.company.trim(), 'i') },
          { slug: queryParams.company.trim().toLowerCase() },
        ],
      }).select('_id');

      const companyIds = matchingCompanies.map((c) => c._id);
      filter.companyId = { $in: companyIds };
    }

    // Date Posted filter
    if (queryParams.datePosted && queryParams.datePosted !== 'all') {
      const now = Date.now();
      if (queryParams.datePosted === 'today') {
        filter.createdAt = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
      } else if (queryParams.datePosted === 'past_week') {
        filter.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
      } else if (queryParams.datePosted === 'past_month') {
        filter.createdAt = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
      }
    }

    // 2. Build Sorting Order
    let sort = { createdAt: -1 }; // Default latest
    if (queryParams.sortBy === 'deadline') {
      sort = { applicationDeadline: 1 };
    } else if (queryParams.sortBy === 'stipend_high') {
      sort = { 'stipend.amount': -1 };
    } else if (queryParams.sortBy === 'stipend_low') {
      sort = { 'stipend.amount': 1 };
    } else if (queryParams.sortBy === 'popularity') {
      sort = { viewsCount: -1, applicationsCount: -1 };
    }

    // 3. Execute DB Queries
    const [internships, total] = await Promise.all([
      Internship.find(filter)
        .populate('companyId', '_id name slug logo location website industry verified')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(filter),
    ]);

    // 4. If student is authenticated, check saved status
    let savedMap = new Set();
    if (studentId && internships.length > 0) {
      const internshipIds = internships.map((i) => i._id);
      const savedDocs = await SavedInternship.find({
        studentId,
        internshipId: { $in: internshipIds },
      }).select('internshipId');

      savedMap = new Set(savedDocs.map((s) => s.internshipId.toString()));
    }

    const data = internships.map((item) => ({
      ...item,
      isSaved: savedMap.has(item._id.toString()),
    }));

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves single internship details by ID or slug.
   */
  static async getInternshipById(idOrSlug, studentId = null) {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

    const internship = await Internship.findOne(query)
      .populate('companyId', '_id name slug logo description location website industry companySize foundedYear verified')
      .populate('createdBy', '_id name email');

    if (!internship) {
      throw new ApiError(404, 'Internship opportunity not found.');
    }

    // Atomic increment of view counter
    await Internship.findByIdAndUpdate(internship._id, { $inc: { viewsCount: 1 } });

    // Check if saved by student
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
  }

  /**
   * Toggles save / bookmark status for an internship.
   */
  static async toggleSaveInternship(studentId, internshipId) {
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
  }

  /**
   * Retrieves paginated saved internships for a student.
   */
  static async getSavedInternships(studentId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 12));
    const skip = (page - 1) * limit;

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
      .filter((r) => r.internshipId) // Filter out any deleted postings
      .map((r) => ({
        ...r.internshipId,
        isSaved: true,
        savedAt: r.createdAt,
      }));

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export default InternshipService;
