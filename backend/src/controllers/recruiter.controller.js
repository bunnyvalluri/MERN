import { RecruiterService } from '../services/recruiter.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/v1/recruiter/company
 * Retrieve recruiter company details.
 */
export const getCompanyProfile = asyncHandler(async (req, res) => {
  const company = await RecruiterService.getCompanyProfile(req.user._id, req.user);
  res.status(200).json(
    new ApiResponse(200, 'Company profile retrieved successfully.', company)
  );
});

/**
 * PUT /api/v1/recruiter/company
 * Update recruiter company details.
 */
export const updateCompanyProfile = asyncHandler(async (req, res) => {
  const auditInfo = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const company = await RecruiterService.updateCompanyProfile(req.user._id, req.body, auditInfo);
  res.status(200).json(
    new ApiResponse(200, 'Company profile updated successfully.', company)
  );
});

/**
 * POST /api/v1/recruiter/internships
 * Create a new internship posting.
 */
export const createInternship = asyncHandler(async (req, res) => {
  const auditInfo = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const internship = await RecruiterService.createInternship(req.user, req.body, auditInfo);
  res.status(201).json(
    new ApiResponse(201, 'Internship created successfully.', internship)
  );
});

/**
 * GET /api/v1/recruiter/internships
 * List recruiter company internships with status filters, search, and pagination.
 */
export const getRecruiterInternships = asyncHandler(async (req, res) => {
  const result = await RecruiterService.getRecruiterInternships(req.user._id, req.query);
  res.status(200).json(
    new ApiResponse(200, 'Recruiter internships retrieved successfully.', result)
  );
});

/**
 * GET /api/v1/recruiter/internships/:id
 * Retrieve single internship for editing (attached to req.internship by verifyInternshipOwnership).
 */
export const getInternshipById = asyncHandler(async (req, res) => {
  const internship = req.internship || (await RecruiterService.getInternshipById(req.params.id));
  res.status(200).json(
    new ApiResponse(200, 'Internship retrieved successfully.', internship)
  );
});

/**
 * PUT /api/v1/recruiter/internships/:id
 * Update an existing internship.
 */
export const updateInternship = asyncHandler(async (req, res) => {
  const auditInfo = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const updated = await RecruiterService.updateInternship(req.user, req.params.id, req.body, auditInfo);
  res.status(200).json(
    new ApiResponse(200, 'Internship updated successfully.', updated)
  );
});

/**
 * PATCH /api/v1/recruiter/internships/:id/publish
 * Publish an internship (DRAFT -> PUBLISHED).
 */
export const publishInternship = asyncHandler(async (req, res) => {
  const auditInfo = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const published = await RecruiterService.publishInternship(req.user, req.params.id, auditInfo);
  res.status(200).json(
    new ApiResponse(200, 'Internship published successfully.', published)
  );
});

/**
 * PATCH /api/v1/recruiter/internships/:id/unpublish
 * Unpublish an internship (PUBLISHED -> DRAFT).
 */
export const unpublishInternship = asyncHandler(async (req, res) => {
  const auditInfo = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const draft = await RecruiterService.unpublishInternship(req.user, req.params.id, auditInfo);
  res.status(200).json(
    new ApiResponse(200, 'Internship reverted to draft successfully.', draft)
  );
});

/**
 * PATCH /api/v1/recruiter/internships/:id/close
 * Close an internship (PUBLISHED -> CLOSED).
 */
export const closeInternship = asyncHandler(async (req, res) => {
  const auditInfo = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const closed = await RecruiterService.closeInternship(req.user, req.params.id, auditInfo);
  res.status(200).json(
    new ApiResponse(200, 'Internship closed successfully.', closed)
  );
});

/**
 * DELETE /api/v1/recruiter/internships/:id
 * Delete an internship.
 */
export const deleteInternship = asyncHandler(async (req, res) => {
  const auditInfo = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  await RecruiterService.deleteInternship(req.user, req.params.id, auditInfo);
  res.status(200).json(
    new ApiResponse(200, 'Internship deleted successfully.', null)
  );
});

/**
 * GET /api/v1/recruiter/internships/:id/applications
 * Retrieve applications submitted to an internship.
 */
export const getInternshipApplications = asyncHandler(async (req, res) => {
  const result = await RecruiterService.getInternshipApplications(req.params.id, req.query);
  res.status(200).json(
    new ApiResponse(200, 'Applications retrieved successfully.', result)
  );
});

/**
 * GET /api/v1/recruiter/analytics
 * Retrieve recruiter dashboard KPI metrics and chart datasets.
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const analytics = await RecruiterService.getDashboardAnalytics(req.user._id);
  res.status(200).json(
    new ApiResponse(200, 'Dashboard analytics retrieved successfully.', analytics)
  );
});

/**
 * GET /api/v1/recruiter/interviews
 * Retrieve recruiter scheduled interviews list.
 */
export const getRecruiterInterviews = asyncHandler(async (req, res) => {
  const result = await RecruiterService.getRecruiterInterviews(req.user._id, req.query);
  res.status(200).json(
    new ApiResponse(200, 'Recruiter interviews retrieved successfully.', result)
  );
});

/**
 * GET /api/v1/recruiter/notifications
 * Retrieve recruiter in-app notifications.
 */
export const getRecruiterNotifications = asyncHandler(async (req, res) => {
  const result = await RecruiterService.getRecruiterNotifications(req.user._id, req.query);
  res.status(200).json(
    new ApiResponse(200, 'Notifications retrieved successfully.', result)
  );
});

/**
 * PATCH /api/v1/recruiter/notifications/:id/read
 * Mark recruiter notification as read.
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notif = await RecruiterService.markNotificationRead(req.user._id, req.params.id);
  res.status(200).json(
    new ApiResponse(200, 'Notification marked as read.', notif)
  );
});

export default {
  getCompanyProfile,
  updateCompanyProfile,
  createInternship,
  getRecruiterInternships,
  getInternshipById,
  updateInternship,
  publishInternship,
  unpublishInternship,
  closeInternship,
  deleteInternship,
  getInternshipApplications,
  getDashboardAnalytics,
  getRecruiterInterviews,
  getRecruiterNotifications,
  markNotificationRead,
};
