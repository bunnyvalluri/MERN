import { AdminService } from '../services/admin.service.js';
import { IngestionService } from '../services/ingestion.service.js';
import { sourceRegistry } from '../connectors/SourceRegistry.js';
import { SyncJob, SYNC_JOB_TYPE } from '../models/SyncJob.model.js';
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

// ─── Source Health & Ingestion Management Handlers ───────────────────────────

export const getSourcesHandler = asyncHandler((req, res) => {
  const metrics = sourceRegistry.getMetrics();
  res.status(200).json(
    new ApiResponse(200, 'Source connector metrics retrieved successfully.', metrics)
  );
});

export const updateSourceHandler = asyncHandler((req, res) => {
  const { name } = req.params;
  const { enabled } = req.body;
  const success = sourceRegistry.setSourceEnabled(name, enabled);

  if (!success) {
    return res.status(404).json(
      new ApiResponse(404, `Source connector "${name}" not found.`)
    );
  }

  res.status(200).json(
    new ApiResponse(200, `Source "${name}" updated successfully.`, {
      name,
      enabled,
    })
  );
});

export const getSyncJobsHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    SyncJob.find({})
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SyncJob.countDocuments({}),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Sync jobs retrieved successfully.', {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  );
});

export const triggerSyncJobHandler = asyncHandler(async (req, res) => {
  const { sourceName } = req.body;
  let results;

  if (sourceName) {
    const connector = sourceRegistry.getConnector(sourceName);
    if (!connector) {
      return res.status(404).json(
        new ApiResponse(404, `Source connector "${sourceName}" not found.`)
      );
    }
    const result = await IngestionService.ingestFromConnector(
      connector,
      SYNC_JOB_TYPE.MANUAL_SYNC,
      req.user._id
    );
    results = [result];
  } else {
    results = await IngestionService.syncAllSources(
      SYNC_JOB_TYPE.MANUAL_SYNC,
      req.user._id
    );
  }

  res.status(200).json(
    new ApiResponse(200, 'Manual sync triggered and executed successfully.', results)
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
  getSourcesHandler,
  updateSourceHandler,
  getSyncJobsHandler,
  triggerSyncJobHandler,
};
