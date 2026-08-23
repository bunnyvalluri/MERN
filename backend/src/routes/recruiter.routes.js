import { Router } from 'express';
import {
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
} from '../controllers/recruiter.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
  requireRecruiter,
  verifyInternshipOwnership,
} from '../middleware/authorization.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createRecruiterInternshipSchema,
  updateRecruiterInternshipSchema,
  companyProfileSchema,
} from '../validators/recruiter.validator.js';

const router = Router();

// All recruiter routes require authenticated session with RECRUITER (or ADMIN) role
router.use(authenticateUser, requireRecruiter);

// ─── Dashboard & Analytics Routes ────────────────────────────────────────────
router.get('/analytics', getDashboardAnalytics);
router.get('/interviews', getRecruiterInterviews);
router.get('/notifications', getRecruiterNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// ─── Company Profile Routes ──────────────────────────────────────────────────
router.get('/company', getCompanyProfile);
router.put('/company', validate(companyProfileSchema), updateCompanyProfile);

// ─── Internship Management Routes ────────────────────────────────────────────
router.get('/internships', getRecruiterInternships);
router.post(
  '/internships',
  validate(createRecruiterInternshipSchema),
  createInternship
);

// Specific Internship Resource Routes (with IDOR Ownership Verification)
router.get(
  '/internships/:id',
  verifyInternshipOwnership,
  getInternshipById
);

router.put(
  '/internships/:id',
  verifyInternshipOwnership,
  validate(updateRecruiterInternshipSchema),
  updateInternship
);

router.patch(
  '/internships/:id/publish',
  verifyInternshipOwnership,
  publishInternship
);

router.patch(
  '/internships/:id/unpublish',
  verifyInternshipOwnership,
  unpublishInternship
);

router.patch(
  '/internships/:id/close',
  verifyInternshipOwnership,
  closeInternship
);

router.delete(
  '/internships/:id',
  verifyInternshipOwnership,
  deleteInternship
);

router.get(
  '/internships/:id/applications',
  verifyInternshipOwnership,
  getInternshipApplications
);

export default router;
