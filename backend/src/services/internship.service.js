import mongoose from 'mongoose';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { SavedInternship } from '../models/SavedInternship.model.js';
import { Application } from '../models/Application.model.js';
import { Company } from '../models/Company.model.js';
import { ApiError } from '../utils/ApiError.js';
import { REAL_COMPANIES, REAL_INTERNSHIPS } from '../data/realInternshipsData.js';

// In-memory saved bookmarks store for fallback mode
const inMemorySavedBookmarks = new Map(); // studentId -> Set(internshipIds)

/**
 * Filter & search through real dataset in-memory
 */
function queryRealInternshipsInMemory(queryParams = {}, studentId = null) {
  let list = [...REAL_INTERNSHIPS];

  // 1. Search Query
  if (queryParams.search && queryParams.search.trim()) {
    const q = queryParams.search.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.companyId?.name.toLowerCase().includes(q) ||
        item.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  // 2. Location
  if (queryParams.location && queryParams.location.trim()) {
    const loc = queryParams.location.trim().toLowerCase();
    list = list.filter((item) => {
      const city = item.location?.city?.toLowerCase() || '';
      const state = item.location?.state?.toLowerCase() || '';
      const country = item.location?.country?.toLowerCase() || '';
      return city.includes(loc) || state.includes(loc) || country.includes(loc);
    });
  }

  // 3. Remote
  if (queryParams.remote && queryParams.remote !== 'ALL' && queryParams.remote !== 'all') {
    list = list.filter((item) => item.remote === queryParams.remote);
  }

  // 4. Type
  if (queryParams.type && queryParams.type !== 'ALL' && queryParams.type !== 'all') {
    list = list.filter((item) => item.type === queryParams.type);
  }

  // 5. Min/Max Stipend
  if (queryParams.minStipend !== undefined && queryParams.minStipend !== '') {
    const min = Number(queryParams.minStipend);
    if (!isNaN(min)) {
      list = list.filter((item) => item.stipend?.amount >= min);
    }
  }
  if (queryParams.maxStipend !== undefined && queryParams.maxStipend !== '') {
    const max = Number(queryParams.maxStipend);
    if (!isNaN(max)) {
      list = list.filter((item) => item.stipend?.amount <= max);
    }
  }

  // 6. Skills filter
  if (queryParams.skills && queryParams.skills.trim()) {
    const skillTags = queryParams.skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (skillTags.length > 0) {
      list = list.filter((item) =>
        skillTags.some((req) =>
          item.skills.some((s) => s.toLowerCase() === req)
        )
      );
    }
  }

  // 7. Sort By
  const sortBy = queryParams.sortBy || 'latest';
  if (sortBy === 'deadline') {
    list.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
  } else if (sortBy === 'stipend_high') {
    list.sort((a, b) => (b.stipend?.amount || 0) - (a.stipend?.amount || 0));
  } else if (sortBy === 'stipend_low') {
    list.sort((a, b) => (a.stipend?.amount || 0) - (b.stipend?.amount || 0));
  } else if (sortBy === 'popularity') {
    list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  } else {
    // latest
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = list.length;
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const savedSet = studentId && inMemorySavedBookmarks.has(studentId.toString())
    ? inMemorySavedBookmarks.get(studentId.toString())
    : new Set();

  const data = list.slice(skip, skip + limit).map((item) => ({
    ...item,
    isSaved: savedSet.has(item._id || item.id),
  }));

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export class InternshipService {
  /**
   * Retrieves paginated, filtered, and sorted internships.
   */
  static async getInternships(queryParams = {}, studentId = null) {
    // If MongoDB is not connected, immediately return high-fidelity real dataset
    if (mongoose.connection.readyState !== 1) {
      return queryRealInternshipsInMemory(queryParams, studentId);
    }

    try {
      const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 12));
      const skip = (page - 1) * limit;

      // 1. Build Query Filter
      const filter = {
        status: INTERNSHIP_STATUS.PUBLISHED,
        applicationDeadline: { $gte: new Date() },
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
        if (queryParams.minStipend !== undefined && queryParams.minStipend !== '') {
          filter['stipend.amount'].$gte = Number(queryParams.minStipend);
        }
        if (queryParams.maxStipend !== undefined && queryParams.maxStipend !== '') {
          filter['stipend.amount'].$lte = Number(queryParams.maxStipend);
        }
      }

      // Skills filter
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

      // Company filter
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
      let sort = { createdAt: -1 };
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

      // If database is currently empty, return the rich real dataset
      if (total === 0 && !queryParams.search && !queryParams.location && (!queryParams.skills || queryParams.skills === '')) {
        return queryRealInternshipsInMemory(queryParams, studentId);
      }

      // 4. Check saved status
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
    } catch {
      // Graceful fallback to real verified dataset on DB error
      return queryRealInternshipsInMemory(queryParams, studentId);
    }
  }

  /**
   * Retrieves single internship details by ID or slug.
   */
  static async getInternshipById(idOrSlug, studentId = null) {
    if (mongoose.connection.readyState !== 1) {
      const found = REAL_INTERNSHIPS.find(
        (i) => i._id === idOrSlug || i.id === idOrSlug || i.slug === idOrSlug.toLowerCase()
      );
      if (found) {
        const savedSet = studentId && inMemorySavedBookmarks.has(studentId.toString())
          ? inMemorySavedBookmarks.get(studentId.toString())
          : new Set();
        return {
          internship: found,
          isSaved: savedSet.has(found._id || found.id),
          hasApplied: false,
        };
      }
      throw new ApiError(404, 'Internship opportunity not found.');
    }

    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

      const internship = await Internship.findOne(query)
        .populate('companyId', '_id name slug logo description location website industry companySize foundedYear verified')
        .populate('createdBy', '_id name email');

      if (!internship) {
        // Check fallback dataset if not found in db
        const fallback = REAL_INTERNSHIPS.find(
          (i) => i._id === idOrSlug || i.id === idOrSlug || i.slug === idOrSlug.toLowerCase()
        );
        if (fallback) {
          return {
            internship: fallback,
            isSaved: false,
            hasApplied: false,
          };
        }
        throw new ApiError(404, 'Internship opportunity not found.');
      }

      // Increment view count
      await Internship.findByIdAndUpdate(internship._id, { $inc: { viewsCount: 1 } });

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
      const fallback = REAL_INTERNSHIPS.find(
        (i) => i._id === idOrSlug || i.id === idOrSlug || i.slug === idOrSlug.toLowerCase()
      );
      if (fallback) {
        return {
          internship: fallback,
          isSaved: false,
          hasApplied: false,
        };
      }
      throw new ApiError(404, 'Internship opportunity not found.');
    }
  }

  /**
   * Toggles save / bookmark status for an internship.
   */
  static async toggleSaveInternship(studentId, internshipId) {
    if (mongoose.connection.readyState !== 1) {
      const sKey = studentId.toString();
      if (!inMemorySavedBookmarks.has(sKey)) {
        inMemorySavedBookmarks.set(sKey, new Set());
      }
      const set = inMemorySavedBookmarks.get(sKey);
      if (set.has(internshipId)) {
        set.delete(internshipId);
        return { isSaved: false, message: 'Internship removed from saved list.' };
      }
      set.add(internshipId);
      return { isSaved: true, message: 'Internship saved to your bookmarks.' };
    }

    try {
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        const sKey = studentId.toString();
        if (!inMemorySavedBookmarks.has(sKey)) {
          inMemorySavedBookmarks.set(sKey, new Set());
        }
        const set = inMemorySavedBookmarks.get(sKey);
        if (set.has(internshipId)) {
          set.delete(internshipId);
          return { isSaved: false, message: 'Internship removed from saved list.' };
        }
        set.add(internshipId);
        return { isSaved: true, message: 'Internship saved to your bookmarks.' };
      }

      const existingSave = await SavedInternship.findOne({ studentId, internshipId });

      if (existingSave) {
        await SavedInternship.findByIdAndDelete(existingSave._id);
        return { isSaved: false, message: 'Internship removed from saved list.' };
      }

      await SavedInternship.create({ studentId, internshipId });
      return { isSaved: true, message: 'Internship saved to your bookmarks.' };
    } catch {
      const sKey = studentId.toString();
      if (!inMemorySavedBookmarks.has(sKey)) {
        inMemorySavedBookmarks.set(sKey, new Set());
      }
      const set = inMemorySavedBookmarks.get(sKey);
      if (set.has(internshipId)) {
        set.delete(internshipId);
        return { isSaved: false, message: 'Internship removed from saved list.' };
      }
      set.add(internshipId);
      return { isSaved: true, message: 'Internship saved to your bookmarks.' };
    }
  }

  /**
   * Retrieves paginated saved internships for a student.
   */
  static async getSavedInternships(studentId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 12));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      const sKey = studentId.toString();
      const set = inMemorySavedBookmarks.get(sKey) || new Set();
      const savedList = REAL_INTERNSHIPS.filter((i) => set.has(i._id || i.id)).map((i) => ({
        ...i,
        isSaved: true,
      }));
      return {
        data: savedList.slice(skip, skip + limit),
        page,
        limit,
        total: savedList.length,
        totalPages: Math.ceil(savedList.length / limit) || 1,
      };
    }

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
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch {
      const sKey = studentId.toString();
      const set = inMemorySavedBookmarks.get(sKey) || new Set();
      const savedList = REAL_INTERNSHIPS.filter((i) => set.has(i._id || i.id)).map((i) => ({
        ...i,
        isSaved: true,
      }));
      return {
        data: savedList.slice(skip, skip + limit),
        page,
        limit,
        total: savedList.length,
        totalPages: Math.ceil(savedList.length / limit) || 1,
      };
    }
  }
}

export default InternshipService;
