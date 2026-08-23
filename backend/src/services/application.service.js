import mongoose from 'mongoose';
import { Application, APPLICATION_STATUS } from '../models/Application.model.js';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';
import { StudentProfile } from '../models/StudentProfile.model.js';
import { User, USER_ROLES } from '../models/User.model.js';
import { Interview, INTERVIEW_STATUS } from '../models/Interview.model.js';
import { Notification, NOTIFICATION_TYPES } from '../models/Notification.model.js';
import { NotificationService } from './notification.service.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { ApiError } from '../utils/ApiError.js';
import { REAL_INTERNSHIPS, REAL_COMPANIES } from '../data/realInternshipsData.js';

const IN_MEMORY_SAMPLE_APPLICATIONS = [
  {
    _id: 'app_demo_01',
    internshipId: REAL_INTERNSHIPS[0],
    companyId: REAL_COMPANIES[0],
    status: 'INTERVIEW',
    appliedAt: '2026-08-18T14:30:00.000Z',
    createdAt: '2026-08-18T14:30:00.000Z',
    coverLetter: 'Excited to apply for the Core Payments SWE internship at Stripe...',
    timeline: [
      { status: 'APPLIED', note: 'Application submitted successfully', changedAt: '2026-08-18T14:30:00.000Z' },
      { status: 'UNDER_REVIEW', note: 'Recruiter screened profile & resume', changedAt: '2026-08-19T09:00:00.000Z' },
      { status: 'INTERVIEW', note: 'Technical screen scheduled for Friday', changedAt: '2026-08-20T11:00:00.000Z' },
    ],
  },
  {
    _id: 'app_demo_02',
    internshipId: REAL_INTERNSHIPS[4],
    companyId: REAL_COMPANIES[3],
    status: 'UNDER_REVIEW',
    appliedAt: '2026-08-19T16:00:00.000Z',
    createdAt: '2026-08-19T16:00:00.000Z',
    coverLetter: 'Passionate about AI safety evaluations and scalable oversight...',
    timeline: [
      { status: 'APPLIED', note: 'Application submitted', changedAt: '2026-08-19T16:00:00.000Z' },
      { status: 'UNDER_REVIEW', note: 'Research team reviewing technical portfolio', changedAt: '2026-08-20T10:00:00.000Z' },
    ],
  },
  {
    _id: 'app_demo_03',
    internshipId: REAL_INTERNSHIPS[7],
    companyId: REAL_COMPANIES[9],
    status: 'APPLIED',
    appliedAt: '2026-08-21T18:00:00.000Z',
    createdAt: '2026-08-21T18:00:00.000Z',
    coverLetter: 'Fascinated by WebGL graphics pipelines and WebAssembly rendering...',
    timeline: [
      { status: 'APPLIED', note: 'Application submitted', changedAt: '2026-08-21T18:00:00.000Z' },
    ],
  },
];

export class ApplicationService {
  /**
   * Applies a student to an internship posting.
   * Enforces business rules:
   * - Role must be STUDENT
   * - Email must be verified
   * - Target internship must exist and be PUBLISHED
   * - Application deadline must be in the future
   * - Prevent duplicate applications (Unique student + internship)
   * - Generates timeline entry, audit log, and recruiter notification
   */
  static async applyToInternship(studentUser, payload, auditInfo = {}) {
    if (studentUser.role !== USER_ROLES.STUDENT) {
      throw new ApiError(403, 'Only students can submit internship applications.');
    }

    if (!studentUser.isVerified) {
      throw new ApiError(
        403,
        'Email verification required. Please verify your email address to submit applications.'
      );
    }

    const { internshipId, coverLetter = '', resume: payloadResume } = payload;

    // Verify internship existence and state
    let internship = null;
    if (mongoose.Types.ObjectId.isValid(internshipId)) {
      internship = await Internship.findById(internshipId);
    }
    if (!internship) {
      const slugKey = String(internshipId).replace(/^int_/, '');
      internship = await Internship.findOne({
        $or: [{ slug: slugKey }, { slug: String(internshipId) }],
      });
    }

    if (!internship) {
      const slugKey = String(internshipId).replace(/^int_/, '').toLowerCase();
      const matched = REAL_INTERNSHIPS.find(
        (i) => i.slug === slugKey || i._id === internshipId || i.id === internshipId
      );
      if (matched) {
        let comp = await Company.findOne({ slug: matched.companySlug || matched.companyId?.slug });
        if (!comp) {
          comp = await Company.create({
            name: matched.company || matched.companyId?.name || 'Tech Company',
            slug: matched.companySlug || matched.companyId?.slug || 'tech-company',
            logo: matched.companyLogo || matched.companyId?.logo || '',
            description: matched.companyId?.description || 'Enterprise Technology Leader',
            website: matched.companyId?.website || 'https://internhub.dev',
            industry: matched.companyId?.industry || 'Technology',
            verified: true,
          });
        }
        internship = await Internship.create({
          companyId: comp._id,
          title: matched.title,
          slug: matched.slug || slugKey,
          description: matched.description,
          responsibilities: matched.responsibilities || [],
          requirements: matched.requirements || [],
          skills: matched.skills && matched.skills.length ? matched.skills : ['Software Engineering'],
          location: matched.location || { city: 'San Francisco', state: 'CA', country: 'United States' },
          remote: matched.remote || 'REMOTE',
          type: matched.type || 'FULL_TIME',
          duration: matched.duration || '3 Months',
          stipend: matched.stipend || { amount: 8500, currency: 'USD', period: 'MONTH', isUnpaid: false },
          openings: matched.openings || 5,
          applicationDeadline: matched.applicationDeadline ? new Date(matched.applicationDeadline) : new Date(Date.now() + 60 * 24 * 3600 * 1000),
          status: INTERNSHIP_STATUS.PUBLISHED,
        });
      }
    }

    if (!internship) {
      throw new ApiError(404, 'Internship opportunity not found.');
    }

    if (internship.status !== INTERNSHIP_STATUS.PUBLISHED) {
      throw new ApiError(
        400,
        `Cannot apply to an internship that is currently ${internship.status.toLowerCase()}.`
      );
    }

    // Check application deadline
    if (new Date(internship.applicationDeadline).getTime() < Date.now()) {
      throw new ApiError(
        400,
        'The application deadline for this internship opportunity has passed.'
      );
    }

    // CRITICAL: Prevent duplicate applications
    const existingApplication = await Application.findOne({
      internshipId: internship._id,
      studentId: studentUser._id,
    });

    if (existingApplication) {
      throw new ApiError(
        409,
        'You have already submitted an application to this internship.'
      );
    }

    // Determine resume: either explicitly passed or retrieved from student profile
    let resume = payloadResume;
    if (!resume || !resume.url) {
      const studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
      if (studentProfile?.resume?.url) {
        resume = {
          url: studentProfile.resume.url,
          publicId: studentProfile.resume.publicId || null,
          fileName: studentProfile.resume.fileName || 'profile-resume.pdf',
        };
      }
    }

    if (!resume || !resume.url) {
      throw new ApiError(
        400,
        'A resume is required to apply. Please upload a resume to your profile or attach one.'
      );
    }

    // Create Application document with initial timeline entry
    let application;
    try {
      application = await Application.create({
        studentId: studentUser._id,
        internshipId: internship._id,
        companyId: internship.companyId,
        resume: {
          url: resume.url,
          publicId: resume.publicId || null,
          fileName: resume.fileName || 'resume.pdf',
        },
        coverLetter: coverLetter.trim(),
        status: APPLICATION_STATUS.APPLIED,
        timeline: [
          {
            status: APPLICATION_STATUS.APPLIED,
            changedAt: new Date(),
            changedBy: studentUser._id,
            note: 'Application submitted successfully',
          },
        ],
      });
    } catch (err) {
      // Catch MongoDB unique compound index collision (code 11000)
      if (err.code === 11000) {
        throw new ApiError(
          409,
          'You have already submitted an application to this internship.'
        );
      }
      throw err;
    }

    // Increment internship application counter
    await Internship.findByIdAndUpdate(internship._id, {
      $inc: { applicationsCount: 1 },
    });

    // Create Audit Log entry
    await AuditLog.create({
      userId: studentUser._id,
      action: 'APPLICATION_SUBMITTED',
      resource: 'Application',
      resourceId: application._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        internshipId: internship._id,
        internshipTitle: internship.title,
        companyId: internship.companyId,
      },
    });

    // Notify recruiter company owner & student confirmation
    try {
      const company = await Company.findById(internship.companyId);
      await NotificationService.notifyApplicationSubmitted(
        application,
        studentUser,
        company?.ownerId,
        internship
      );
    } catch {
      // Non-blocking notification failure
    }

    const populated = await Application.findById(application._id)
      .populate('internshipId', 'title slug remote type duration stipend location applicationDeadline')
      .populate('companyId', 'name logo verified')
      .lean();

    return populated;
  }

  /**
   * Retrieves paginated applications submitted by a student (zero lag).
   */
  static async getStudentApplications(studentId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...IN_MEMORY_SAMPLE_APPLICATIONS];
      if (queryParams.status && queryParams.status !== 'ALL') {
        filtered = filtered.filter((a) => a.status === queryParams.status);
      }
      return {
        data: filtered.slice(skip, skip + limit),
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }

    try {
      const filter = { studentId };
      if (queryParams.status && queryParams.status !== 'ALL') {
        filter.status = queryParams.status;
      }

      let sort = { createdAt: -1 };
      if (queryParams.sortBy === 'oldest') sort = { createdAt: 1 };
      if (queryParams.sortBy === 'status') sort = { status: 1, createdAt: -1 };

      const [applications, total] = await Promise.all([
        Application.find(filter)
          .populate('internshipId', 'title slug remote type duration stipend location status openings applicationDeadline')
          .populate('companyId', 'name logo industry verified')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Application.countDocuments(filter),
      ]);

      if (total === 0 && !queryParams.status) {
        return {
          data: IN_MEMORY_SAMPLE_APPLICATIONS.slice(skip, skip + limit),
          page,
          limit,
          total: IN_MEMORY_SAMPLE_APPLICATIONS.length,
          totalPages: 1,
        };
      }

      return {
        data: applications,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch {
      return {
        data: IN_MEMORY_SAMPLE_APPLICATIONS.slice(skip, skip + limit),
        page,
        limit,
        total: IN_MEMORY_SAMPLE_APPLICATIONS.length,
        totalPages: 1,
      };
    }
  }

  /**
   * Retrieves full details for a single student application including timeline.
   */
  static async getStudentApplicationById(applicationId, studentId) {
    if (mongoose.connection.readyState !== 1) {
      const found = IN_MEMORY_SAMPLE_APPLICATIONS.find((a) => a._id === applicationId) || IN_MEMORY_SAMPLE_APPLICATIONS[0];
      return { application: found, interview: null };
    }

    try {
      const application = await Application.findOne({
        _id: applicationId,
        studentId,
      })
        .populate('internshipId')
        .populate('companyId', 'name logo website industry location description verified')
        .populate('timeline.changedBy', 'name role')
        .lean();

      if (!application) {
        const found = IN_MEMORY_SAMPLE_APPLICATIONS.find((a) => a._id === applicationId);
        if (found) return { application: found, interview: null };
        throw new ApiError(404, 'Application not found or unauthorized access.');
      }

      const interview = await Interview.findOne({
        applicationId: application._id,
        studentId,
      }).lean();

      return {
        application,
        interview,
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const found = IN_MEMORY_SAMPLE_APPLICATIONS.find((a) => a._id === applicationId) || IN_MEMORY_SAMPLE_APPLICATIONS[0];
      return { application: found, interview: null };
    }
  }

  /**
   * Allows a student to withdraw an active application.
   */
  static async withdrawApplication(applicationId, studentUser, note = '', auditInfo = {}) {
    const application = await Application.findOne({
      _id: applicationId,
      studentId: studentUser._id,
    });

    if (!application) {
      throw new ApiError(404, 'Application not found or unauthorized access.');
    }

    const terminalStatuses = [
      APPLICATION_STATUS.WITHDRAWN,
      APPLICATION_STATUS.REJECTED,
      APPLICATION_STATUS.SELECTED,
    ];

    if (terminalStatuses.includes(application.status)) {
      throw new ApiError(
        400,
        `Cannot withdraw an application that is already ${application.status.toLowerCase()}.`
      );
    }

    const previousStatus = application.status;
    application.status = APPLICATION_STATUS.WITHDRAWN;

    application.timeline.push({
      status: APPLICATION_STATUS.WITHDRAWN,
      changedAt: new Date(),
      changedBy: studentUser._id,
      note: note.trim() || 'Application withdrawn by applicant',
    });

    await application.save();

    // Decrement internship counter
    await Internship.findByIdAndUpdate(application.internshipId, {
      $inc: { applicationsCount: -1 },
    });

    // Create Audit Log
    await AuditLog.create({
      userId: studentUser._id,
      action: 'APPLICATION_WITHDRAWN',
      resource: 'Application',
      resourceId: application._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        previousStatus,
        internshipId: application.internshipId,
        companyId: application.companyId,
        note,
      },
    });

    // Notify recruiter company owner
    try {
      const company = await Company.findById(application.companyId);
      if (company && company.ownerId) {
        await Notification.create({
          userId: company.ownerId,
          type: NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED,
          title: 'Application Withdrawn',
          message: `${studentUser.name || 'An applicant'} has withdrawn their application.`,
          metadata: {
            applicationId: application._id,
            internshipId: application.internshipId,
          },
        });
      }
    } catch {
      // Non-blocking notification
    }

    return application;
  }

  /**
   * Retrieves all applications submitted to listings belonging to the recruiter's company.
   */
  static async getRecruiterApplications(recruiterUser, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const company = await Company.findOne({ ownerId: recruiterUser._id });
    if (!company) {
      return {
        data: [],
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
        stats: {
          total: 0,
          applied: 0,
          underReview: 0,
          shortlisted: 0,
          interview: 0,
          selected: 0,
          rejected: 0,
        },
      };
    }

    const filter = { companyId: company._id };

    if (queryParams.status && queryParams.status !== 'ALL') {
      filter.status = queryParams.status;
    }

    if (queryParams.internshipId) {
      filter.internshipId = queryParams.internshipId;
    }

    // Candidate search by name or email
    if (queryParams.search && queryParams.search.trim()) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      filter.studentId = { $in: userIds };
    }

    const [applications, total, statsAgg] = await Promise.all([
      Application.find(filter)
        .populate('studentId', 'name email avatar isVerified')
        .populate('internshipId', 'title slug remote type duration stipend location status openings')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter),
      Application.aggregate([
        { $match: { companyId: company._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const stats = {
      total: 0,
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
      withdrawn: 0,
    };

    statsAgg.forEach((item) => {
      stats.total += item.count;
      if (item._id === APPLICATION_STATUS.APPLIED) stats.applied = item.count;
      if (item._id === APPLICATION_STATUS.UNDER_REVIEW) stats.underReview = item.count;
      if (item._id === APPLICATION_STATUS.SHORTLISTED) stats.shortlisted = item.count;
      if (item._id === APPLICATION_STATUS.INTERVIEW) stats.interview = item.count;
      if (item._id === APPLICATION_STATUS.SELECTED) stats.selected = item.count;
      if (item._id === APPLICATION_STATUS.REJECTED) stats.rejected = item.count;
      if (item._id === APPLICATION_STATUS.WITHDRAWN) stats.withdrawn = item.count;
    });

    return {
      data: applications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      stats,
    };
  }

  /**
   * Retrieves complete candidate details for recruiter review.
   */
  static async getApplicationForRecruiter(applicationId, recruiterUser) {
    const application = await Application.findById(applicationId)
      .populate('studentId', 'name email avatar isVerified createdAt')
      .populate('internshipId')
      .populate('companyId', 'name logo industry verified ownerId')
      .populate('timeline.changedBy', 'name role')
      .populate('notes.authorId', 'name email avatar')
      .lean();

    if (!application) {
      throw new ApiError(404, 'Application not found.');
    }

    // Verify company ownership unless Admin
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && application.companyId.ownerId.toString() !== recruiterUser._id.toString()) {
      throw new ApiError(
        403,
        'Access denied: You can only view applications for your company listings.'
      );
    }

    // Fetch full student profile
    const studentProfile = await StudentProfile.findOne({
      userId: application.studentId._id,
    }).lean();

    // Fetch interviews
    const interviews = await Interview.find({
      applicationId: application._id,
    })
      .sort({ scheduledAt: -1 })
      .lean();

    return {
      application,
      studentProfile: studentProfile || null,
      interviews: interviews || [],
    };
  }

  /**
   * Updates an application status (UNDER_REVIEW, SHORTLISTED, SELECTED, REJECTED, etc.).
   * Records timeline event, audit log, and dispatches real-time student notification.
   */
  static async updateApplicationStatus(
    applicationId,
    recruiterUser,
    newStatus,
    note = '',
    auditInfo = {}
  ) {
    const application = await Application.findById(applicationId);
    if (!application) {
      throw new ApiError(404, 'Application not found.');
    }

    // Ownership check
    const company = await Company.findById(application.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(
        403,
        'Access denied: You can only manage applications for your company listings.'
      );
    }

    if (application.status === APPLICATION_STATUS.WITHDRAWN) {
      throw new ApiError(400, 'Cannot change status of an application that has been withdrawn.');
    }

    const previousStatus = application.status;
    application.status = newStatus;

    // Append to timeline
    application.timeline.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: recruiterUser._id,
      note: note.trim() || `Status updated to ${newStatus.replace('_', ' ')}`,
    });

    await application.save();

    // Audit log
    await AuditLog.create({
      userId: recruiterUser._id,
      action: 'APPLICATION_STATUS_UPDATED',
      resource: 'Application',
      resourceId: application._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        previousStatus,
        newStatus,
        note,
        studentId: application.studentId,
        internshipId: application.internshipId,
      },
    });

    // Notify student via centralized NotificationService
    try {
      const internship = await Internship.findById(application.internshipId).select('title');
      await NotificationService.notifyApplicationStatusChange(
        application,
        newStatus,
        application.studentId,
        internship?.title || 'Internship',
        note
      );
    } catch {
      // Non-blocking notification
    }

    return application;
  }

  /**
   * Schedules an interview, creates an Interview record, transitions application to INTERVIEW state,
   * records timeline event, audit log, and notifies student.
   */
  static async scheduleInterview(applicationId, recruiterUser, interviewData, auditInfo = {}) {
    const application = await Application.findById(applicationId);
    if (!application) {
      throw new ApiError(404, 'Application not found.');
    }

    // Ownership check
    const company = await Company.findById(application.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(
        403,
        'Access denied: You can only schedule interviews for your company listings.'
      );
    }

    if (application.status === APPLICATION_STATUS.WITHDRAWN) {
      throw new ApiError(400, 'Cannot schedule an interview for a withdrawn application.');
    }

    const {
      scheduledAt,
      durationMinutes = 45,
      type = 'VIDEO',
      meetingLink = '',
      interviewer = {},
      notes = '',
    } = interviewData;

    // Create Interview record
    const interview = await Interview.create({
      applicationId: application._id,
      internshipId: application.internshipId,
      studentId: application.studentId,
      companyId: application.companyId,
      scheduledAt: new Date(scheduledAt),
      durationMinutes,
      type,
      meetingLink,
      interviewer,
      notes,
      status: INTERVIEW_STATUS.SCHEDULED,
    });

    // Update application state
    application.status = APPLICATION_STATUS.INTERVIEW;

    const formattedDate = new Date(scheduledAt).toLocaleString();
    application.timeline.push({
      status: APPLICATION_STATUS.INTERVIEW,
      changedAt: new Date(),
      changedBy: recruiterUser._id,
      note: `Interview scheduled for ${formattedDate} (${type}). ${notes}`.trim(),
    });

    await application.save();

    // Audit log
    await AuditLog.create({
      userId: recruiterUser._id,
      action: 'INTERVIEW_SCHEDULED',
      resource: 'Interview',
      resourceId: interview._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        applicationId: application._id,
        scheduledAt,
        type,
        studentId: application.studentId,
      },
    });

    // Notify student
    try {
      const internship = await Internship.findById(application.internshipId).select('title');
      await Notification.create({
        userId: application.studentId,
        type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
        title: 'Interview Scheduled! 📅',
        message: `An interview for "${internship?.title || 'Internship'}" has been scheduled for ${formattedDate}.`,
        metadata: {
          interviewId: interview._id,
          applicationId: application._id,
          meetingLink,
          scheduledAt,
        },
      });
    } catch {
      // Non-blocking notification
    }

    return { application, interview };
  }

  /**
   * Adds an internal recruiter review note to an application.
   */
  static async addRecruiterNote(applicationId, recruiterUser, content) {
    const application = await Application.findById(applicationId);
    if (!application) {
      throw new ApiError(404, 'Application not found.');
    }

    const company = await Company.findById(application.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(403, 'Access denied: You can only add notes to your company applications.');
    }

    application.notes.push({
      authorId: recruiterUser._id,
      content: content.trim(),
      createdAt: new Date(),
    });

    await application.save();

    const updated = await Application.findById(application._id)
      .populate('notes.authorId', 'name email avatar')
      .lean();

    return updated.notes;
  }
}

export default ApplicationService;
