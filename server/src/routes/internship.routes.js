import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  toggleSaveInternship,
  getSavedInternships,
} from '../controllers/internship.controller.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.middleware.js';
import { requireStudent } from '../middleware/authorization.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getInternshipsQuerySchema } from '../validators/internship.validator.js';

const router = Router();

// Public / Discovery Endpoints
router.get('/', optionalAuth, validate(getInternshipsQuerySchema, 'query'), getInternships);

// Student Saved Bookmarks (Placed before /:id parameter route)
router.get('/saved', authenticateUser, requireStudent, getSavedInternships);

// Single Internship Details
router.get('/:id', optionalAuth, getInternshipById);

// Student Bookmark Toggle
router.post('/:id/save', authenticateUser, requireStudent, toggleSaveInternship);

export default router;
