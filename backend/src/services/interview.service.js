import { Interview, INTERVIEW_STATUS, INTERVIEW_TYPE } from '../models/Interview.model.js';
import { Application, APPLICATION_STATUS } from '../models/Application.model.js';
import { Internship } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';
import { NotificationService } from './notification.service.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { USER_ROLES } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

export class InterviewService {
  /**
   * Schedules a new interview for a candidate application.
   */
  static async scheduleInterview(recruiterUser, payload, auditInfo = {}) {
    const {
      applicationId,
      scheduledAt,
      durationMinutes = 45,
      duration,
      type = INTERVIEW_TYPE.VIDEO,
      meetingUrl = '',
      meetingLink = '',
      interviewer = {},
      notes = '',
    } = payload;

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
      throw new ApiError(400, 'Interview date and time must be in the future.');
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      throw new ApiError(404, 'Application not found.');
    }

    // Verify company ownership unless Admin
    const company = await Company.findById(application.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(
        403,
        'Access denied: You can only schedule interviews for your company applications.'
      );
    }

    if (
      application.status === APPLICATION_STATUS.WITHDRAWN ||
      application.status === APPLICATION_STATUS.REJECTED
    ) {
      throw new ApiError(
        400,
        `Cannot schedule an interview for an application that is ${application.status.toLowerCase()}.`
      );
    }

    const finalMeetingLink = meetingUrl || meetingLink || '';
    const finalDuration = durationMinutes || duration || 45;

    // Create Interview document
    const interview = await Interview.create({
      applicationId: application._id,
      internshipId: application.internshipId,
      studentId: application.studentId,
      companyId: application.companyId,
      recruiterId: recruiterUser._id,
      scheduledAt: scheduledDate,
      durationMinutes: finalDuration,
      type,
      meetingLink: finalMeetingLink,
      interviewer,
      notes: notes.trim(),
      status: INTERVIEW_STATUS.SCHEDULED,
    });

    // Update application state to INTERVIEW and record timeline event
    application.status = APPLICATION_STATUS.INTERVIEW;
    application.timeline.push({
      status: APPLICATION_STATUS.INTERVIEW,
      changedAt: new Date(),
      changedBy: recruiterUser._id,
      note: `Interview scheduled for ${scheduledDate.toLocaleString()} (${type}). ${notes}`.trim(),
    });
    await application.save();

    // Create Audit Log
    await AuditLog.create({
      userId: recruiterUser._id,
      action: 'INTERVIEW_SCHEDULED',
      resource: 'Interview',
      resourceId: interview._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        applicationId: application._id,
        scheduledAt: scheduledDate,
        type,
        studentId: application.studentId,
      },
    });

    // Notify Student via centralized NotificationService
    try {
      const internship = await Internship.findById(application.internshipId).select('title');
      await NotificationService.notifyInterviewScheduled(
        interview,
        application.studentId,
        internship?.title || 'Internship',
        scheduledDate,
        finalMeetingLink
      );
    } catch {
      // Non-blocking notification
    }

    const populated = await Interview.findById(interview._id)
      .populate('studentId', 'name email avatar isVerified')
      .populate('internshipId', 'title slug location remote')
      .populate('companyId', 'name logo verified')
      .lean();

    return populated;
  }

  /**
   * Reschedules an active interview with a new date/time.
   */
  static async rescheduleInterview(interviewId, recruiterUser, payload, auditInfo = {}) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new ApiError(404, 'Interview record not found.');
    }

    // Verify company ownership
    const company = await Company.findById(interview.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(
        403,
        'Access denied: You can only reschedule interviews for your organization.'
      );
    }

    if (
      interview.status === INTERVIEW_STATUS.CANCELLED ||
      interview.status === INTERVIEW_STATUS.COMPLETED
    ) {
      throw new ApiError(
        400,
        `Cannot reschedule an interview that is already ${interview.status.toLowerCase()}.`
      );
    }

    const newDate = new Date(payload.scheduledAt);
    if (isNaN(newDate.getTime()) || newDate.getTime() <= Date.now()) {
      throw new ApiError(400, 'New interview date and time must be in the future.');
    }

    const previousDate = interview.scheduledAt;
    interview.scheduledAt = newDate;
    interview.status = INTERVIEW_STATUS.RESCHEDULED;

    if (payload.durationMinutes || payload.duration) {
      interview.durationMinutes = payload.durationMinutes || payload.duration;
    }
    if (payload.type) {
      interview.type = payload.type;
    }
    if (payload.meetingUrl !== undefined || payload.meetingLink !== undefined) {
      interview.meetingLink = payload.meetingUrl || payload.meetingLink || interview.meetingLink;
    }
    if (payload.notes !== undefined) {
      interview.notes = payload.notes.trim();
    }

    await interview.save();

    // Record timeline entry in associated application
    try {
      const application = await Application.findById(interview.applicationId);
      if (application) {
        application.timeline.push({
          status: APPLICATION_STATUS.INTERVIEW,
          changedAt: new Date(),
          changedBy: recruiterUser._id,
          note: `Interview rescheduled to ${newDate.toLocaleString()}. Reason: ${
            payload.reason || 'Schedule update'
          }`,
        });
        await application.save();
      }
    } catch {
      // Non-blocking timeline push
    }

    // Audit Log
    await AuditLog.create({
      userId: recruiterUser._id,
      action: 'INTERVIEW_RESCHEDULED',
      resource: 'Interview',
      resourceId: interview._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        previousDate,
        newDate,
        reason: payload.reason,
        studentId: interview.studentId,
      },
    });

    // Notify Student via centralized NotificationService
    try {
      const internship = await Internship.findById(interview.internshipId).select('title');
      await NotificationService.notifyInterviewRescheduled(
        interview,
        interview.studentId,
        internship?.title || 'Internship',
        newDate,
        payload.reason
      );
    } catch {
      // Non-blocking notification
    }

    const updated = await Interview.findById(interview._id)
      .populate('studentId', 'name email avatar isVerified')
      .populate('internshipId', 'title slug location remote')
      .populate('companyId', 'name logo verified')
      .lean();

    return updated;
  }

  /**
   * Cancels a scheduled interview with an explanation note.
   */
  static async cancelInterview(interviewId, recruiterUser, reason = '', auditInfo = {}) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new ApiError(404, 'Interview not found.');
    }

    // Ownership check
    const company = await Company.findById(interview.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(
        403,
        'Access denied: You can only cancel interviews for your organization.'
      );
    }

    if (interview.status === INTERVIEW_STATUS.CANCELLED) {
      throw new ApiError(400, 'Interview is already cancelled.');
    }

    interview.status = INTERVIEW_STATUS.CANCELLED;
    if (reason) {
      interview.notes = `${interview.notes ? `${interview.notes}\n` : ''}Cancellation Reason: ${reason.trim()}`.trim();
    }
    await interview.save();

    // Timeline event
    try {
      const application = await Application.findById(interview.applicationId);
      if (application) {
        application.timeline.push({
          status: application.status,
          changedAt: new Date(),
          changedBy: recruiterUser._id,
          note: `Interview scheduled for ${new Date(
            interview.scheduledAt
          ).toLocaleString()} was cancelled. Reason: ${reason || 'Cancelled by recruiter'}`,
        });
        await application.save();
      }
    } catch {
      // Non-blocking
    }

    // Audit Log
    await AuditLog.create({
      userId: recruiterUser._id,
      action: 'INTERVIEW_CANCELLED',
      resource: 'Interview',
      resourceId: interview._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        reason,
        studentId: interview.studentId,
      },
    });

    // Notify Student via centralized NotificationService
    try {
      const internship = await Internship.findById(interview.internshipId).select('title');
      await NotificationService.notifyInterviewCancelled(
        interview,
        interview.studentId,
        internship?.title || 'Internship',
        interview.scheduledAt,
        reason
      );
    } catch {
      // Non-blocking
    }

    return interview;
  }

  /**
   * Updates meeting link, notes, and interviewer details.
   */
  static async updateInterviewDetails(interviewId, recruiterUser, payload, _auditInfo = {}) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new ApiError(404, 'Interview not found.');
    }

    const company = await Company.findById(interview.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(403, 'Access denied to this interview.');
    }

    if (payload.meetingUrl !== undefined || payload.meetingLink !== undefined) {
      interview.meetingLink = payload.meetingUrl || payload.meetingLink || '';
    }
    if (payload.notes !== undefined) {
      interview.notes = payload.notes.trim();
    }
    if (payload.interviewer) {
      interview.interviewer = payload.interviewer;
    }

    await interview.save();

    const updated = await Interview.findById(interview._id)
      .populate('studentId', 'name email avatar isVerified')
      .populate('internshipId', 'title slug location remote')
      .populate('companyId', 'name logo verified')
      .lean();

    return updated;
  }

  /**
   * Marks an interview as completed with optional feedback/rating.
   */
  static async completeInterview(interviewId, recruiterUser, feedback = {}) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new ApiError(404, 'Interview not found.');
    }

    const company = await Company.findById(interview.companyId);
    const isAdmin =
      recruiterUser.role === USER_ROLES.ADMIN || recruiterUser.role === USER_ROLES.SUPER_ADMIN;

    if (!isAdmin && (!company || company.ownerId.toString() !== recruiterUser._id.toString())) {
      throw new ApiError(403, 'Access denied to this interview.');
    }

    interview.status = INTERVIEW_STATUS.COMPLETED;
    if (feedback.rating || feedback.notes) {
      interview.feedback = {
        rating: feedback.rating || 5,
        notes: feedback.notes || '',
        submittedAt: new Date(),
      };
    }
    await interview.save();

    return interview;
  }

  /**
   * Retrieves interviews scheduled for a student with calendar & timeframe filters.
   */
  static async getStudentInterviews(studentId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const now = new Date();

    const filter = { studentId };

    if (queryParams.status && queryParams.status !== 'ALL') {
      filter.status = queryParams.status;
    }

    if (queryParams.timeframe === 'upcoming') {
      filter.scheduledAt = { $gte: now };
      filter.status = { $ne: INTERVIEW_STATUS.CANCELLED };
    } else if (queryParams.timeframe === 'past') {
      filter.scheduledAt = { $lt: now };
    }

    const sortOrder = queryParams.timeframe === 'upcoming' ? { scheduledAt: 1 } : { scheduledAt: -1 };

    const [interviews, total, upcomingCount, pastCount] = await Promise.all([
      Interview.find(filter)
        .populate('internshipId', 'title slug location remote duration stipend')
        .populate('companyId', 'name logo industry website verified')
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Interview.countDocuments(filter),
      Interview.countDocuments({
        studentId,
        scheduledAt: { $gte: now },
        status: { $ne: INTERVIEW_STATUS.CANCELLED },
      }),
      Interview.countDocuments({
        studentId,
        scheduledAt: { $lt: now },
      }),
    ]);

    return {
      data: interviews,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      upcomingCount,
      pastCount,
    };
  }

  /**
   * Retrieves single interview details verifying participant access.
   */
  static async getInterviewById(interviewId, user) {
    const interview = await Interview.findById(interviewId)
      .populate('studentId', 'name email avatar isVerified')
      .populate('internshipId', 'title slug location remote duration stipend description')
      .populate('companyId', 'name logo industry website verified ownerId')
      .populate('applicationId', 'status timeline')
      .lean();

    if (!interview) {
      throw new ApiError(404, 'Interview not found.');
    }

    const isStudentParticipant = interview.studentId._id.toString() === user._id.toString();
    const isCompanyOwner = interview.companyId.ownerId.toString() === user._id.toString();
    const isAdmin =
      user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN;

    if (!isStudentParticipant && !isCompanyOwner && !isAdmin) {
      throw new ApiError(403, 'Access denied: You are not authorized to view this interview.');
    }

    return interview;
  }
}

export default InterviewService;
