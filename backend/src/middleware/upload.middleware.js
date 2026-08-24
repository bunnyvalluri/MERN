import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

// ─── Disallowed Malicious Extensions ─────────────────────────────────────────
const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.bin',
  '.msi',
  '.dll',
  '.com',
  '.js',
  '.mjs',
  '.ts',
  '.py',
  '.php',
  '.vbs',
  '.pl',
  '.cgi',
  '.html',
  '.htm',
  '.xhtml',
  '.jsp',
  '.asp',
  '.aspx',
  '.jar',
  '.scr',
]);

// ─── Supported File Categories ───────────────────────────────────────────────
const FILE_CONFIGS = {
  resume: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimes: ['application/pdf'],
    allowedExts: ['.pdf'],
    label: 'Resume (PDF format up to 50MB)',
  },
  avatar: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExts: ['.jpg', '.jpeg', '.png', '.webp'],
    label: 'Profile Avatar (JPEG, PNG, WEBP up to 50MB)',
  },
  companyLogo: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ],
    allowedExts: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    label: 'Company Logo (JPEG, PNG, WEBP, SVG up to 50MB)',
  },
  certificate: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    allowedExts: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    label: 'Certificate (PDF, JPEG, PNG, WEBP up to 50MB)',
  },
  document: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    allowedExts: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    label: 'General Document (up to 50MB)',
  },
};

/**
 * Sanitizes a filename to prevent path traversal and null byte injections.
 */
export const sanitizeFileName = (originalName = '') => {
  return originalName
    .replace(/(\.\.[/\\])+/g, '') // strip ../ and ..\
    .replace(/[^\w.\-\s]/g, '') // remove special characters
    .replace(/\s+/g, '_')
    .slice(0, 100);
};

/**
 * Creates a Multer memory-storage instance for a given file category.
 */
const createMulterInstance = (categoryKey) => {
  const config = FILE_CONFIGS[categoryKey] || FILE_CONFIGS.document;

  const storage = multer.memoryStorage(); // In-memory RAM buffer only

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    // 1. Check for malicious extensions
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return cb(
        new ApiError(
          400,
          `File type "${ext}" is blocked for security reasons. Executables and scripts are rejected.`
        ),
        false
      );
    }

    // 2. Validate allowed extensions
    if (!config.allowedExts.includes(ext)) {
      return cb(
        new ApiError(
          400,
          `Invalid file extension "${ext}". Allowed types for this upload: ${config.allowedExts.join(', ')}.`
        ),
        false
      );
    }

    // 3. Validate MIME type
    if (!config.allowedMimes.includes(mime)) {
      return cb(
        new ApiError(
          400,
          `Invalid MIME type "${mime}". Expected: ${config.allowedMimes.join(', ')}.`
        ),
        false
      );
    }

    // Sanitize the original name on the file object
    file.sanitizedName = sanitizeFileName(file.originalname) || `file-${Date.now()}${ext}`;

    cb(null, true);
  };

  return multer({
    storage,
    limits: {
      fileSize: config.maxSize,
      files: 1, // Single file upload per field
    },
    fileFilter,
  });
};

/**
 * Wrapper middleware to handle Multer upload and catch errors cleanly.
 */
const handleUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) {
        if (!req.file) {
          return next(new ApiError(400, 'No file was provided in the upload request.'));
        }
        return next();
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(
              400,
              'The uploaded file exceeds the maximum allowed file size limit.'
            )
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new ApiError(
              400,
              `Unexpected field name "${err.field}". Please use the expected upload field.`
            )
          );
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      }

      if (err instanceof ApiError) {
        return next(err);
      }

      return next(new ApiError(400, err.message || 'Malformed file upload request.'));
    });
  };
};

// ─── Exported Upload Middlewares ─────────────────────────────────────────────
export const uploadResume = handleUpload(
  createMulterInstance('resume').single('file')
);

export const uploadAvatar = handleUpload(
  createMulterInstance('avatar').single('file')
);

export const uploadCompanyLogo = handleUpload(
  createMulterInstance('companyLogo').single('file')
);

export const uploadCertificate = handleUpload(
  createMulterInstance('certificate').single('file')
);

export const uploadGeneralDocument = handleUpload(
  createMulterInstance('document').single('file')
);
