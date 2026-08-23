import { ApplicationService } from '../services/application.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/v1/applications
 * Student submits application to an internship posting.
 */
export const applyToInternship = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const application = await ApplicationService.applyToInternship(
    req.user,
    req.body,
    auditInfo
  );
  res.status(201).json(
    new ApiResponse(201, 'Application submitted successfully.', application)
  );
});

/**
 * GET /api/v1/applications/me
 * Student retrieves their list of submitted applications.
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const result = await ApplicationService.getStudentApplications(
    req.user._id,
    req.query
  );
  res.status(200).json(
    new ApiResponse(200, 'Applications retrieved successfully.', result)
  );
});

/**
 * GET /api/v1/applications/:id
 * Student retrieves single application details and timeline.
 */
export const getStudentApplicationById = asyncHandler(async (req, res) => {
  const result = await ApplicationService.getStudentApplicationById(
    req.params.id,
    req.user._id
  );
  res.status(200).json(
    new ApiResponse(200, 'Application details retrieved successfully.', result)
  );
});

/**
 * PATCH /api/v1/applications/:id/withdraw
 * Student withdraws their active application.
 */
export const withdrawApplication = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const application = await ApplicationService.withdrawApplication(
    req.params.id,
    req.user,
    req.body.note,
    auditInfo
  );
  res.status(200).json(
    new ApiResponse(200, 'Application withdrawn successfully.', application)
  );
});

/**
 * GET /api/v1/applications/recruiter/all
 * Recruiter retrieves all applications submitted to their company listings.
 */
export const getRecruiterApplications = asyncHandler(async (req, res) => {
  const result = await ApplicationService.getRecruiterApplications(
    req.user,
    req.query
  );
  res.status(200).json(
    new ApiResponse(200, 'Recruiter applications retrieved successfully.', result)
  );
});

/**
 * GET /api/v1/applications/recruiter/:id
 * Recruiter retrieves candidate application, student profile, notes, and timeline.
 */
export const getApplicationForRecruiter = asyncHandler(async (req, res) => {
  const result = await ApplicationService.getApplicationForRecruiter(
    req.params.id,
    req.user
  );
  res.status(200).json(
    new ApiResponse(200, 'Candidate application retrieved successfully.', result)
  );
});

/**
 * PATCH /api/v1/applications/recruiter/:id/status
 * Recruiter transitions candidate status (UNDER_REVIEW, SHORTLISTED, SELECTED, REJECTED).
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const application = await ApplicationService.updateApplicationStatus(
    req.params.id,
    req.user,
    req.body.status,
    req.body.note,
    auditInfo
  );
  res.status(200).json(
    new ApiResponse(200, 'Application status updated successfully.', application)
  );
});

/**
 * POST /api/v1/applications/recruiter/:id/schedule-interview
 * Recruiter schedules an interview and transitions status to INTERVIEW.
 */
export const scheduleInterview = asyncHandler(async (req, res) => {
  const auditInfo = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  const result = await ApplicationService.scheduleInterview(
    req.params.id,
    req.user,
    req.body,
    auditInfo
  );
  res.status(201).json(
    new ApiResponse(201, 'Interview scheduled successfully.', result)
  );
});

/**
 * POST /api/v1/applications/recruiter/:id/notes
 * Recruiter adds internal review note.
 */
export const addRecruiterNote = asyncHandler(async (req, res) => {
  const notes = await ApplicationService.addRecruiterNote(
    req.params.id,
    req.user,
    req.body.content
  );
  res.status(201).json(
    new ApiResponse(201, 'Review note added successfully.', notes)
  );
});

export default {
  applyToInternship,
  getMyApplications,
  getStudentApplicationById,
  withdrawApplication,
  getRecruiterApplications,
  getApplicationForRecruiter,
  updateApplicationStatus,
  scheduleInterview,
  addRecruiterNote,
};
