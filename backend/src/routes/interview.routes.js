import { Router } from 'express';
import {
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  updateInterviewDetails,
  completeInterview,
  getStudentInterviews,
  getInterviewById,
} from '../controllers/interview.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
  requireStudent,
  requireRecruiter,
} from '../middleware/authorization.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  scheduleInterviewSchema,
  rescheduleInterviewSchema,
  cancelInterviewSchema,
  updateInterviewDetailsSchema,
  completeInterviewSchema,
  getInterviewsQuerySchema,
} from '../validators/interview.validator.js';

const router = Router();

// All interview routes require authenticated session
router.use(authenticateUser);

// ─── Student Interview Routes ────────────────────────────────────────────────
router.get(
  '/student/me',
  requireStudent,
  validate(getInterviewsQuerySchema, 'query'),
  getStudentInterviews
);

// ─── Recruiter Interview Management Routes ───────────────────────────────────
router.post(
  '/',
  requireRecruiter,
  validate(scheduleInterviewSchema),
  scheduleInterview
);

router.patch(
  '/:id/reschedule',
  requireRecruiter,
  validate(rescheduleInterviewSchema),
  rescheduleInterview
);

router.patch(
  '/:id/cancel',
  requireRecruiter,
  validate(cancelInterviewSchema),
  cancelInterview
);

router.patch(
  '/:id/details',
  requireRecruiter,
  validate(updateInterviewDetailsSchema),
  updateInterviewDetails
);

router.patch(
  '/:id/complete',
  requireRecruiter,
  validate(completeInterviewSchema),
  completeInterview
);

// ─── Shared Detail Route (Guarded with Participant Verification) ─────────────
router.get('/:id', getInterviewById);

export default router;
