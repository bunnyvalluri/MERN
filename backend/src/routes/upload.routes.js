import { Router } from 'express';
import {
  uploadResumeHandler,
  uploadAvatarHandler,
  uploadCompanyLogoHandler,
  uploadCertificateHandler,
  replaceDocumentHandler,
  deleteDocumentHandler,
  getDocumentSecureHandler,
  getUserDocumentsHandler,
} from '../controllers/upload.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/authorization.middleware.js';
import {
  uploadResume,
  uploadAvatar,
  uploadCompanyLogo,
  uploadCertificate,
  uploadGeneralDocument,
} from '../middleware/upload.middleware.js';
import { USER_ROLES } from '../models/User.model.js';

const router = Router();

// All upload routes require authenticated session
router.use(authenticateUser);

// ─── File Upload Routes ──────────────────────────────────────────────────────
router.post(
  '/resume',
  requireRole([USER_ROLES.STUDENT, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  uploadResume,
  uploadResumeHandler
);

router.post('/avatar', uploadAvatar, uploadAvatarHandler);

router.post(
  '/company-logo',
  requireRole([USER_ROLES.RECRUITER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  uploadCompanyLogo,
  uploadCompanyLogoHandler
);

router.post(
  '/certificate',
  requireRole([USER_ROLES.STUDENT, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  uploadCertificate,
  uploadCertificateHandler
);

// ─── Document Operations ─────────────────────────────────────────────────────
router.get('/documents', getUserDocumentsHandler);
router.get('/documents/:id', getDocumentSecureHandler);
router.put('/documents/:id', uploadGeneralDocument, replaceDocumentHandler);
router.delete('/documents/:id', deleteDocumentHandler);

export default router;
