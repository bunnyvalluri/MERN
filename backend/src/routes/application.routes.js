import { Router } from 'express';
import {
  applyToInternship,
  getMyApplications,
  getStudentApplicationById,
  withdrawApplication,
  getRecruiterApplications,
  getApplicationForRecruiter,
  updateApplicationStatus,
  scheduleInterview,
  addRecruiterNote,
} from '../controllers/application.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
  requireStudent,
  requireRecruiter,
} from '../middleware/authorization.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  applyInternshipSchema,
  withdrawApplicationSchema,
  updateApplicationStatusSchema,
  scheduleInterviewSchema,
  addApplicationNoteSchema,
  getStudentApplicationsQuerySchema,
  getRecruiterApplicationsQuerySchema,
} from '../validators/application.validator.js';

const router = Router();

// All application routes require authenticated session
router.use(authenticateUser);

// ─── Student Application Routes ──────────────────────────────────────────────
router.post(
  '/',
  requireStudent,
  validate(applyInternshipSchema),
  applyToInternship
);

router.get(
  '/me',
  requireStudent,
  validate(getStudentApplicationsQuerySchema, 'query'),
  getMyApplications
);

router.get(
  '/:id',
  requireStudent,
  getStudentApplicationById
);

router.patch(
  '/:id/withdraw',
  requireStudent,
  validate(withdrawApplicationSchema),
  withdrawApplication
);

// ─── Recruiter Application Management Routes ─────────────────────────────────
router.get(
  '/recruiter/all',
  requireRecruiter,
  validate(getRecruiterApplicationsQuerySchema, 'query'),
  getRecruiterApplications
);

router.get(
  '/recruiter/:id',
  requireRecruiter,
  getApplicationForRecruiter
);

router.patch(
  '/recruiter/:id/status',
  requireRecruiter,
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

router.post(
  '/recruiter/:id/schedule-interview',
  requireRecruiter,
  validate(scheduleInterviewSchema),
  scheduleInterview
);

router.post(
  '/recruiter/:id/notes',
  requireRecruiter,
  validate(addApplicationNoteSchema),
  addRecruiterNote
);

export default router;
