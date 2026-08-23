import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
  getStudentById,
} from '../controllers/student.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireStudent } from '../middleware/authorization.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  updateStudentProfileSchema,
  resumeUploadSchema,
} from '../validators/student.validator.js';

const router = Router();

// Student-specific profile management routes (Guaranteed own-profile scope)
router.get('/me', authenticateUser, requireStudent, getMyProfile);
router.put('/me', authenticateUser, requireStudent, validate(updateStudentProfileSchema), updateMyProfile);
router.post('/me/resume', authenticateUser, requireStudent, validate(resumeUploadSchema), uploadResume);
router.delete('/me/resume', authenticateUser, requireStudent, deleteResume);

// Public / Recruiter access to student profiles
router.get('/:id', authenticateUser, getStudentById);

export default router;
