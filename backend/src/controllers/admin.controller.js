import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

export const getDashboardMetricsHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.getDashboardMetrics();
  res.status(200).json(
    new ApiResponse(200, 'Admin metrics retrieved successfully.', result)
  );
});

export const getUsersHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.getUsers(req.query);
  res.status(200).json(
    new ApiResponse(200, 'Users retrieved successfully.', result)
  );
});

export const updateUserStatusHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.updateUserStatus(
    req.params.id,
    req.body,
    req.user,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  logger.info('Admin: user status updated', {
    event: 'ADMIN_USER_STATUS_CHANGE',
    actorId: req.user._id.toString(),
    actorRole: req.user.role,
    targetUserId: req.params.id,
    changes: req.body,
    requestId: req.requestId,
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

export const getCompaniesHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.getCompanies(req.query);
  res.status(200).json(
    new ApiResponse(200, 'Companies retrieved successfully.', result)
  );
});

export const verifyCompanyHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.verifyCompany(
    req.params.id,
    req.body,
    req.user,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  logger.info('Admin: company verification updated', {
    event: 'ADMIN_COMPANY_VERIFY',
    actorId: req.user._id.toString(),
    actorRole: req.user.role,
    companyId: req.params.id,
    changes: req.body,
    requestId: req.requestId,
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

export const getInternshipsHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.getInternships(req.query);
  res.status(200).json(
    new ApiResponse(200, 'Internships retrieved successfully.', result)
  );
});

export const updateInternshipStatusHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.updateInternshipStatus(
    req.params.id,
    req.body,
    req.user,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  logger.info('Admin: internship status updated', {
    event: 'ADMIN_INTERNSHIP_STATUS_CHANGE',
    actorId: req.user._id.toString(),
    internshipId: req.params.id,
    changes: req.body,
    requestId: req.requestId,
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

export const deleteInternshipHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.deleteInternship(
    req.params.id,
    req.user,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  logger.info('Admin: internship deleted', {
    event: 'ADMIN_INTERNSHIP_DELETE',
    actorId: req.user._id.toString(),
    actorRole: req.user.role,
    internshipId: req.params.id,
    requestId: req.requestId,
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

export const getApplicationsHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.getApplications(req.query);
  res.status(200).json(
    new ApiResponse(200, 'Applications retrieved successfully.', result)
  );
});

export const getAuditLogsHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.getAuditLogs(req.query);
  res.status(200).json(
    new ApiResponse(200, 'Audit logs retrieved successfully.', result)
  );
});

export const broadcastNotificationHandler = asyncHandler(async (req, res) => {
  const result = await AdminService.broadcastNotification(
    req.body,
    req.user,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  logger.info('Admin: broadcast notification sent', {
    event: 'ADMIN_BROADCAST_NOTIFICATION',
    actorId: req.user._id.toString(),
    type: req.body.type,
    recipientCount: result.count,
    requestId: req.requestId,
    ip: req.ip,
  });

  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

export default {
  getDashboardMetricsHandler,
  getUsersHandler,
  updateUserStatusHandler,
  getCompaniesHandler,
  verifyCompanyHandler,
  getInternshipsHandler,
  updateInternshipStatusHandler,
  deleteInternshipHandler,
  getApplicationsHandler,
  getAuditLogsHandler,
  broadcastNotificationHandler,
};
