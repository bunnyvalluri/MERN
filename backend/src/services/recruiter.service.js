import crypto from 'crypto';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { Application, APPLICATION_STATUS } from '../models/Application.model.js';
import { Interview, INTERVIEW_STATUS } from '../models/Interview.model.js';
import { Notification } from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Utility to create URL-safe slug from title.
 */
const generateSlug = (text) => {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${randomSuffix}`;
};

export class RecruiterService {
  /**
   * Retrieves or initializes recruiter's company profile.
   */
  static async getCompanyProfile(ownerId, user = null) {
    let company = await Company.findOne({ ownerId });

    if (!company) {
      const companyName = user?.name ? `${user.name}'s Company` : 'Hiring Organization';
      company = await Company.create({
        ownerId,
        name: companyName,
        slug: generateSlug(companyName),
        description: 'Tech startup and hiring team looking for top software engineering talent.',
        industry: 'Software & Technology',
        companySize: '11-50',
      });
    }

    return company;
  }

  /**
   * Updates company profile details.
   */
  static async updateCompanyProfile(ownerId, updateData, auditInfo = {}) {
    let company = await Company.findOne({ ownerId });

    if (!company) {
      company = new Company({ ownerId, ...updateData, slug: generateSlug(updateData.name || 'Company') });
    } else {
      if (updateData.name && updateData.name !== company.name) {
        company.slug = generateSlug(updateData.name);
      }
      Object.assign(company, updateData);
    }

    await company.save();

    // Audit logging
    await AuditLog.create({
      userId: ownerId,
      action: 'COMPANY_UPDATED',
      resource: 'Company',
      resourceId: company._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: { companyName: company.name },
    });

    return company;
  }

  /**
   * Creates a new internship posting with validation and audit logging.
   */
  static async createInternship(user, internshipData, auditInfo = {}) {
    // 1. Resolve company
    let company = await Company.findOne({ ownerId: user._id });
    if (!company) {
      company = await this.getCompanyProfile(user._id, user);
    }

    // 2. Validate openings count
    const openings = parseInt(internshipData.openings, 10) || 1;
    if (openings < 1) {
      throw new ApiError(400, 'Openings count must be a positive integer (minimum 1).');
    }

    // 3. Validate deadline
    const deadline = new Date(internshipData.applicationDeadline);
    if (isNaN(deadline.getTime())) {
      throw new ApiError(400, 'Application deadline must be a valid date.');
    }

    // If initial status is PUBLISHED, deadline must be in the future
    if (internshipData.status === INTERNSHIP_STATUS.PUBLISHED && deadline.getTime() <= Date.now()) {
      throw new ApiError(400, 'Application deadline must be in the future to publish this internship.');
    }

    // 4. Create document
    const slug = generateSlug(internshipData.title);

    const internship = new Internship({
      ...internshipData,
      companyId: company._id,
      slug,
      openings,
      applicationDeadline: deadline,
      createdBy: user._id,
      status: internshipData.status || INTERNSHIP_STATUS.DRAFT,
    });

    await internship.save();

    // 5. Audit Logging
    await AuditLog.create({
      userId: user._id,
      action: 'INTERNSHIP_CREATED',
      resource: 'Internship',
      resourceId: internship._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        title: internship.title,
        status: internship.status,
        companyId: company._id,
      },
    });

    return internship;
  }

  /**
   * Retrieves recruiter's company internships with status filters, search, and pagination.
   */
  static async getRecruiterInternships(ownerId, queryParams = {}) {
    const company = await Company.findOne({ ownerId });
    if (!company) {
      return { data: [], page: 1, limit: 10, total: 0, totalPages: 1 };
    }

    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { companyId: company._id };

    // Status filtering
    if (queryParams.status && queryParams.status !== 'ALL') {
      if (queryParams.status === 'EXPIRED') {
        filter.status = INTERNSHIP_STATUS.PUBLISHED;
        filter.applicationDeadline = { $lt: new Date() };
      } else {
        filter.status = queryParams.status;
      }
    }

    // Title search
    if (queryParams.search && queryParams.search.trim()) {
      filter.title = new RegExp(queryParams.search.trim(), 'i');
    }

    const [internships, total] = await Promise.all([
      Internship.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(filter),
    ]);

    // Attach computed isExpired flag and applicant counts
    const data = internships.map((item) => ({
      ...item,
      isExpired: item.applicationDeadline ? new Date(item.applicationDeadline).getTime() < Date.now() : false,
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
   * Validates that the recruiter owns the company/internship or is an administrator.
   */
  static async verifyInternshipOwnership(internship, user) {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return;
    const company = await Company.findById(internship.companyId);
    const isOwner =
      (company && company.ownerId?.toString() === user._id.toString()) ||
      (internship.createdBy && internship.createdBy?.toString() === user._id.toString());
    if (!isOwner) {
      throw new ApiError(403, 'Access denied: You do not have permission to manage this internship.');
    }
  }

  /**
   * Updates an existing internship with audit logging.
   */
  static async updateInternship(user, internshipId, updateData, auditInfo = {}) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

    await this.verifyInternshipOwnership(internship, user);

    // If title changed, update slug
    if (updateData.title && updateData.title !== internship.title) {
      internship.slug = generateSlug(updateData.title);
    }

    // If deadline updated and status is PUBLISHED, check future date
    if (updateData.applicationDeadline) {
      const newDeadline = new Date(updateData.applicationDeadline);
      if (isNaN(newDeadline.getTime())) {
        throw new ApiError(400, 'Invalid application deadline date.');
      }
      if (
        (updateData.status === INTERNSHIP_STATUS.PUBLISHED || internship.status === INTERNSHIP_STATUS.PUBLISHED) &&
        newDeadline.getTime() <= Date.now()
      ) {
        throw new ApiError(400, 'Application deadline must be in the future for published opportunities.');
      }
      updateData.applicationDeadline = newDeadline;
    }

    Object.assign(internship, updateData);
    await internship.save();

    // Audit Logging
    await AuditLog.create({
      userId: user._id,
      action: 'INTERNSHIP_UPDATED',
      resource: 'Internship',
      resourceId: internship._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: { title: internship.title, updatedFields: Object.keys(updateData) },
    });

    return internship;
  }

  /**
   * Publishes an internship (DRAFT -> PUBLISHED).
   */
  static async publishInternship(user, internshipId, auditInfo = {}) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

    await this.verifyInternshipOwnership(internship, user);

    // Validate mandatory fields
    if (!internship.title || !internship.description || !internship.skills || internship.skills.length === 0) {
      throw new ApiError(400, 'Cannot publish internship. Title, description, and at least one skill tag are required.');
    }

    // Validate future deadline
    if (!internship.applicationDeadline || new Date(internship.applicationDeadline).getTime() <= Date.now()) {
      throw new ApiError(400, 'Cannot publish internship with an expired or missing application deadline.');
    }

    internship.status = INTERNSHIP_STATUS.PUBLISHED;
    await internship.save();

    await AuditLog.create({
      userId: user._id,
      action: 'INTERNSHIP_PUBLISHED',
      resource: 'Internship',
      resourceId: internship._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
    });

    return internship;
  }

  /**
   * Unpublishes an internship (PUBLISHED -> DRAFT).
   */
  static async unpublishInternship(user, internshipId, auditInfo = {}) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

    await this.verifyInternshipOwnership(internship, user);

    internship.status = INTERNSHIP_STATUS.DRAFT;
    await internship.save();

    await AuditLog.create({
      userId: user._id,
      action: 'INTERNSHIP_UNPUBLISHED',
      resource: 'Internship',
      resourceId: internship._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
    });

    return internship;
  }

  /**
   * Closes an internship (PUBLISHED -> CLOSED, stops receiving applications).
   */
  static async closeInternship(user, internshipId, auditInfo = {}) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

    await this.verifyInternshipOwnership(internship, user);

    internship.status = INTERNSHIP_STATUS.CLOSED;
    await internship.save();

    await AuditLog.create({
      userId: user._id,
      action: 'INTERNSHIP_CLOSED',
      resource: 'Internship',
      resourceId: internship._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
    });

    return internship;
  }

  /**
   * Deletes an internship posting with audit logging.
   */
  static async deleteInternship(user, internshipId, auditInfo = {}) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

    await this.verifyInternshipOwnership(internship, user);

    await Internship.findByIdAndDelete(internshipId);

    await AuditLog.create({
      userId: user._id,
      action: 'INTERNSHIP_DELETED',
      resource: 'Internship',
      resourceId: internshipId,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: { title: internship.title },
    });

    return true;
  }

  /**
   * Retrieves applications submitted to a recruiter's internship.
   */
  static async getInternshipApplications(internshipId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { internshipId };
    if (queryParams.status && queryParams.status !== 'ALL') {
      filter.status = queryParams.status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('studentId', '_id name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves full dashboard analytics, real-time metrics, and chart datasets.
   */
  static async getDashboardAnalytics(userId) {
    let company = await Company.findOne({ ownerId: userId });
    if (!company) {
      company = await this.getCompanyProfile(userId);
    }

    const companyId = company._id;
    const now = new Date();

    // 1. KPI Metrics
    const [
      activeInternships,
      totalApplications,
      shortlistedCandidates,
      upcomingInterviews,
      selectedCandidates,
    ] = await Promise.all([
      Internship.countDocuments({
        companyId,
        status: INTERNSHIP_STATUS.PUBLISHED,
        applicationDeadline: { $gte: now },
      }),
      Application.countDocuments({ companyId }),
      Application.countDocuments({
        companyId,
        status: APPLICATION_STATUS.SHORTLISTED,
      }),
      Interview.countDocuments({
        companyId,
        status: INTERVIEW_STATUS.SCHEDULED,
        scheduledAt: { $gte: now },
      }),
      Application.countDocuments({
        companyId,
        status: APPLICATION_STATUS.SELECTED,
      }),
    ]);

    // 2. Analytics: Applications by week (last 6 weeks)
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const weeklyAgg = await Application.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: sixWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$createdAt' },
            week: { $isoWeek: '$createdAt' },
          },
          count: { $sum: 1 },
          firstDate: { $min: '$createdAt' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    // Build complete 6-week array ensuring zero-fill for inactive weeks
    const applicationsByWeek = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekLabel = `W${6 - i}`;
      const dateRangeLabel = `${weekStart.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })}`;

      const matched = weeklyAgg.find((w) => {
        const itemDate = new Date(w.firstDate);
        return Math.abs(itemDate - weekStart) < 7 * 24 * 60 * 60 * 1000;
      });

      applicationsByWeek.push({
        week: weekLabel,
        label: dateRangeLabel,
        count: matched ? matched.count : 0,
      });
    }

    // 3. Analytics: Applications by internship (Top 5)
    const internshipAgg = await Application.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$internshipId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'internships',
          localField: '_id',
          foreignField: '_id',
          as: 'internship',
        },
      },
      { $unwind: { path: '$internship', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          title: { $ifNull: ['$internship.title', 'Internship Opportunity'] },
        },
      },
    ]);

    const applicationsByInternship = internshipAgg.map((item) => ({
      internshipId: item._id,
      title: item.title,
      count: item.count,
    }));

    // 4. Analytics: Status distribution
    const statusAgg = await Application.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    statusAgg.forEach((s) => {
      if (statusCounts[s._id] !== undefined) {
        statusCounts[s._id] = s.count;
      }
    });

    const statusDistribution = [
      { status: 'APPLIED', label: 'Applied', count: statusCounts.APPLIED, color: '#3B82F6' },
      { status: 'UNDER_REVIEW', label: 'Under Review', count: statusCounts.UNDER_REVIEW, color: '#A855F7' },
      { status: 'SHORTLISTED', label: 'Shortlisted', count: statusCounts.SHORTLISTED, color: '#F59E0B' },
      { status: 'INTERVIEW', label: 'Interview', count: statusCounts.INTERVIEW, color: '#14B8A6' },
      { status: 'SELECTED', label: 'Selected', count: statusCounts.SELECTED, color: '#10B981' },
      { status: 'REJECTED', label: 'Rejected', count: statusCounts.REJECTED, color: '#EF4444' },
    ];

    // 5. Recent streams
    const [recentApplications, upcomingInterviewsList, recentInternships] =
      await Promise.all([
        Application.find({ companyId })
          .populate('studentId', 'name email avatar isVerified')
          .populate('internshipId', 'title slug remote duration')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Interview.find({
          companyId,
          status: INTERVIEW_STATUS.SCHEDULED,
          scheduledAt: { $gte: now },
        })
          .populate('studentId', 'name email avatar')
          .populate('internshipId', 'title')
          .sort({ scheduledAt: 1 })
          .limit(5)
          .lean(),
        Internship.find({ companyId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return {
      metrics: {
        activeInternships,
        totalApplications,
        shortlistedCandidates,
        upcomingInterviews,
        selectedCandidates,
      },
      analytics: {
        applicationsByWeek,
        applicationsByInternship,
        statusDistribution,
      },
      recentApplications,
      upcomingInterviews: upcomingInterviewsList,
      recentInternships,
      company,
    };
  }

  /**
   * Retrieves all company interviews for the recruiter portal.
   */
  static async getRecruiterInterviews(userId, queryParams = {}) {
    const company = await Company.findOne({ ownerId: userId });
    if (!company) {
      return { data: [], page: 1, limit: 10, total: 0, totalPages: 1 };
    }

    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { companyId: company._id };
    if (queryParams.status && queryParams.status !== 'ALL') {
      filter.status = queryParams.status;
    }

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate('studentId', 'name email avatar')
        .populate('internshipId', 'title slug location')
        .sort({ scheduledAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Interview.countDocuments(filter),
    ]);

    return {
      data: interviews,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves recruiter notifications.
   */
  static async getRecruiterNotifications(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (queryParams.unreadOnly === 'true') {
      filter.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return {
      data: notifications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount,
    };
  }

  /**
   * Marks a notification as read.
   */
  static async markNotificationRead(userId, notificationId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
    if (!notif) {
      throw new ApiError(404, 'Notification not found.');
    }
    return notif;
  }
}

export default RecruiterService;
