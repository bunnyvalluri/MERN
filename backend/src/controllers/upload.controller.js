import { DocumentService } from '../services/document.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/v1/upload/resume
 * Uploads a student resume PDF (max 5MB).
 */
export const uploadResumeHandler = asyncHandler(async (req, res) => {
  const result = await DocumentService.uploadResume(
    req.user,
    req.file,
    req.body,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  res.status(201).json(
    new ApiResponse(201, 'Resume uploaded successfully.', result)
  );
});

/**
 * POST /api/v1/upload/avatar
 * Uploads user profile avatar image (max 2MB).
 */
export const uploadAvatarHandler = asyncHandler(async (req, res) => {
  const result = await DocumentService.uploadAvatar(
    req.user,
    req.file,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  res.status(201).json(
    new ApiResponse(201, 'Avatar uploaded successfully.', result)
  );
});

/**
 * POST /api/v1/upload/company-logo
 * Uploads company logo image (max 3MB).
 */
export const uploadCompanyLogoHandler = asyncHandler(async (req, res) => {
  const result = await DocumentService.uploadCompanyLogo(
    req.user,
    req.file,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  res.status(201).json(
    new ApiResponse(201, 'Company logo uploaded successfully.', result)
  );
});

/**
 * POST /api/v1/upload/certificate
 * Uploads certificate document or image (max 5MB).
 */
export const uploadCertificateHandler = asyncHandler(async (req, res) => {
  const result = await DocumentService.uploadCertificate(
    req.user,
    req.file,
    req.body,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  res.status(201).json(
    new ApiResponse(201, 'Certificate uploaded successfully.', result)
  );
});

/**
 * PUT /api/v1/upload/documents/:id
 * Replaces an existing document with a new upload.
 */
export const replaceDocumentHandler = asyncHandler(async (req, res) => {
  const document = await DocumentService.replaceDocument(
    req.params.id,
    req.user,
    req.file,
    req.body,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  res.status(200).json(
    new ApiResponse(200, 'Document replaced successfully.', document)
  );
});

/**
 * DELETE /api/v1/upload/documents/:id
 * Deletes document from cloud storage and removes database metadata.
 */
export const deleteDocumentHandler = asyncHandler(async (req, res) => {
  const result = await DocumentService.deleteDocument(
    req.params.id,
    req.user,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  res.status(200).json(
    new ApiResponse(200, result.message, result)
  );
});

/**
 * GET /api/v1/upload/documents/:id
 * Retrieves document details securely with authorization / IDOR validation.
 */
export const getDocumentSecureHandler = asyncHandler(async (req, res) => {
  const document = await DocumentService.getDocumentSecure(
    req.params.id,
    req.user,
    {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  );

  res.status(200).json(
    new ApiResponse(200, 'Document retrieved successfully.', document)
  );
});

/**
 * GET /api/v1/upload/documents
 * Lists documents belonging to the authenticated user.
 */
export const getUserDocumentsHandler = asyncHandler(async (req, res) => {
  const result = await DocumentService.getUserDocuments(
    req.user._id,
    req.query
  );

  res.status(200).json(
    new ApiResponse(200, 'Documents retrieved successfully.', result)
  );
});

export default {
  uploadResumeHandler,
  uploadAvatarHandler,
  uploadCompanyLogoHandler,
  uploadCertificateHandler,
  replaceDocumentHandler,
  deleteDocumentHandler,
  getDocumentSecureHandler,
  getUserDocumentsHandler,
};
