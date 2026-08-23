import crypto from 'crypto';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { Application } from '../models/Application.model.js';
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
   * Updates an existing internship with audit logging.
   */
  static async updateInternship(user, internshipId, updateData, auditInfo = {}) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

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
}

export default RecruiterService;
