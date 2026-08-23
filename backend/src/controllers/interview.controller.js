import { InterviewService } from '../services/interview.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/v1/interviews
 * Recruiter schedules a new interview for a candidate.
 */
export const scheduleInterview = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const interview = await InterviewService.scheduleInterview(
    req.user,
    req.body,
    auditInfo
  );
  res.status(201).json(
    new ApiResponse(201, 'Interview scheduled successfully.', interview)
  );
});

/**
 * PATCH /api/v1/interviews/:id/reschedule
 * Recruiter reschedules an interview to a new date/time.
 */
export const rescheduleInterview = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const interview = await InterviewService.rescheduleInterview(
    req.params.id,
    req.user,
    req.body,
    auditInfo
  );
  res.status(200).json(
    new ApiResponse(200, 'Interview rescheduled successfully.', interview)
  );
});

/**
 * PATCH /api/v1/interviews/:id/cancel
 * Recruiter cancels an interview with an explanation reason.
 */
export const cancelInterview = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const interview = await InterviewService.cancelInterview(
    req.params.id,
    req.user,
    req.body.reason,
    auditInfo
  );
  res.status(200).json(
    new ApiResponse(200, 'Interview cancelled successfully.', interview)
  );
});

/**
 * PATCH /api/v1/interviews/:id/details
 * Recruiter updates meeting link, notes, or interviewer information.
 */
export const updateInterviewDetails = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const interview = await InterviewService.updateInterviewDetails(
    req.params.id,
    req.user,
    req.body,
    auditInfo
  );
  res.status(200).json(
    new ApiResponse(200, 'Interview details updated successfully.', interview)
  );
});

/**
 * PATCH /api/v1/interviews/:id/complete
 * Recruiter marks an interview as completed with feedback.
 */
export const completeInterview = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const interview = await InterviewService.completeInterview(
    req.params.id,
    req.user,
    req.body,
    auditInfo
  );
  res.status(200).json(
    new ApiResponse(200, 'Interview marked as completed.', interview)
  );
});

/**
 * GET /api/v1/interviews/student/me
 * Student retrieves their scheduled interviews (upcoming and past).
 */
export const getStudentInterviews = asyncHandler(async (req, res) => {
  const result = await InterviewService.getStudentInterviews(
    req.user._id,
    req.query
  );
  res.status(200).json(
    new ApiResponse(200, 'Student interviews retrieved successfully.', result)
  );
});

/**
 * GET /api/v1/interviews/:id
 * Participant or company recruiter views interview details.
 */
export const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await InterviewService.getInterviewById(
    req.params.id,
    req.user
  );
  res.status(200).json(
    new ApiResponse(200, 'Interview retrieved successfully.', interview)
  );
});

export default {
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  updateInterviewDetails,
  completeInterview,
  getStudentInterviews,
  getInterviewById,
};
