import { Router } from 'express';
import {
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
} from '../controllers/admin.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/authorization.middleware.js';
import { USER_ROLES } from '../models/User.model.js';

const router = Router();

// All Admin routes require authenticated ADMIN or SUPER_ADMIN session
router.use(
  authenticateUser,
  requireRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN])
);

// ─── Admin Endpoints ─────────────────────────────────────────────────────────
router.get('/metrics', getDashboardMetricsHandler);
router.get('/users', getUsersHandler);
router.patch('/users/:id/status', updateUserStatusHandler);
router.get('/companies', getCompaniesHandler);
router.patch('/companies/:id/verify', verifyCompanyHandler);
router.get('/internships', getInternshipsHandler);
router.patch('/internships/:id/status', updateInternshipStatusHandler);
router.delete('/internships/:id', deleteInternshipHandler);
router.get('/applications', getApplicationsHandler);
router.get('/audit-logs', getAuditLogsHandler);
router.post('/broadcast', broadcastNotificationHandler);

// ─── Ingestion & Source Monitoring Endpoints ────────────────────────────────
router.get('/sources', getSourcesHandler);
router.patch('/sources/:name', updateSourceHandler);
router.get('/sync-jobs', getSyncJobsHandler);
router.post('/sync-jobs/trigger', triggerSyncJobHandler);

export default router;
