import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  toggleSaveInternship,
  getSavedInternships,
} from '../controllers/internship.controller.js';
import streamRouter from './stream.routes.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.middleware.js';
import { requireStudent } from '../middleware/authorization.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getInternshipsQuerySchema } from '../validators/internship.validator.js';

const router = Router();

// Real-Time Server-Sent Events (SSE) Discovery Stream (Must be placed before parameterized /:id)
router.use('/stream', streamRouter);

// Student Saved Bookmarks (Placed before /:id parameter route)
router.get('/saved', authenticateUser, requireStudent, getSavedInternships);

// Public / Discovery Endpoints
router.get('/', optionalAuth, validate(getInternshipsQuerySchema, 'query'), getInternships);

// Single Internship Details
router.get('/:id', optionalAuth, getInternshipById);

// Student Bookmark Toggle
router.post('/:id/save', authenticateUser, requireStudent, toggleSaveInternship);

export default router;
