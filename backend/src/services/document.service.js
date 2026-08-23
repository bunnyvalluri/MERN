import { Document, DOCUMENT_TYPE } from '../models/Document.model.js';
import { StudentProfile } from '../models/StudentProfile.model.js';
import { User, USER_ROLES } from '../models/User.model.js';
import { Company } from '../models/Company.model.js';
import { Application } from '../models/Application.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { StorageService } from './storage.service.js';
import { ApiError } from '../utils/ApiError.js';

export class DocumentService {
  /**
   * 1. Upload Student Resume (PDF, max 5MB)
   */
  static async uploadResume(user, file, payload = {}, auditInfo = {}) {
    if (user.role !== USER_ROLES.STUDENT && user.role !== USER_ROLES.ADMIN) {
      throw new ApiError(403, 'Only students can upload resumes.');
    }

    const { title = 'Resume', isDefault = true } = payload;

    // Upload memory buffer to Cloud Storage
    const storageResult = await StorageService.uploadBuffer(file.buffer, {
      folder: 'internhub/resumes',
      publicId: `resume-${user._id}`,
      format: 'pdf',
    });

    // If marked default, unset previous default resumes
    if (isDefault) {
      await Document.updateMany(
        { userId: user._id, type: DOCUMENT_TYPE.RESUME },
        { isDefault: false }
      );
    }

    // Persist Document metadata in MongoDB
    const document = await Document.create({
      userId: user._id,
      title: title.trim(),
      type: DOCUMENT_TYPE.RESUME,
      fileUrl: storageResult.url,
      publicId: storageResult.publicId,
      fileName: file.sanitizedName || file.originalname,
      fileSize: storageResult.bytes || file.size,
      mimeType: file.mimetype,
      isDefault: Boolean(isDefault),
      isPrivate: true,
    });

    // Sync to StudentProfile
    let profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: user._id,
        skills: [],
      });
    }

    if (isDefault) {
      profile.resumes.forEach((r) => {
        r.isDefault = false;
      });
    }

    profile.resumes.unshift({
      title: document.title,
      fileUrl: document.fileUrl,
      publicId: document.publicId,
      fileName: document.fileName,
      fileSize: document.fileSize,
      isDefault: Boolean(isDefault),
      uploadedAt: new Date(),
    });

    if (isDefault || !profile.resume) {
      profile.resume = document.fileUrl;
    }
    await profile.save();

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'FILE_UPLOADED',
      resource: 'Document',
      resourceId: document._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        type: DOCUMENT_TYPE.RESUME,
        fileName: document.fileName,
        fileSize: document.fileSize,
      },
    });

    return { document, profile };
  }

  /**
   * 2. Upload Profile Avatar (JPEG, PNG, WEBP, max 2MB)
   */
  static async uploadAvatar(user, file, auditInfo = {}) {
    const storageResult = await StorageService.uploadBuffer(file.buffer, {
      folder: 'internhub/avatars',
      publicId: `avatar-${user._id}`,
      format: file.mimetype.split('/')[1] || 'jpg',
    });

    // Update user avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { avatar: storageResult.url },
      { new: true }
    );

    // Persist Document metadata
    const document = await Document.create({
      userId: user._id,
      title: 'Profile Avatar',
      type: DOCUMENT_TYPE.AVATAR,
      fileUrl: storageResult.url,
      publicId: storageResult.publicId,
      fileName: file.sanitizedName || file.originalname,
      fileSize: storageResult.bytes || file.size,
      mimeType: file.mimetype,
      isDefault: true,
      isPrivate: false, // Publicly viewable
    });

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'FILE_UPLOADED',
      resource: 'Document',
      resourceId: document._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        type: DOCUMENT_TYPE.AVATAR,
        fileName: document.fileName,
        fileSize: document.fileSize,
      },
    });

    return { document, user: updatedUser };
  }

  /**
   * 3. Upload Company Logo (JPEG, PNG, WEBP, SVG, max 3MB)
   */
  static async uploadCompanyLogo(recruiterUser, file, auditInfo = {}) {
    let company = await Company.findOne({ ownerId: recruiterUser._id });
    if (!company) {
      if (recruiterUser.role === USER_ROLES.ADMIN) {
        company = await Company.findOne();
      }
      if (!company) {
        throw new ApiError(404, 'Company profile not found. Please create one first.');
      }
    }

    const storageResult = await StorageService.uploadBuffer(file.buffer, {
      folder: 'internhub/logos',
      publicId: `logo-${company._id}`,
      format: file.mimetype.split('/')[1] || 'png',
    });

    // Update company logo URL
    company.logo = storageResult.url;
    await company.save();

    // Persist Document metadata
    const document = await Document.create({
      userId: recruiterUser._id,
      title: `${company.name} Logo`,
      type: DOCUMENT_TYPE.COMPANY_LOGO,
      fileUrl: storageResult.url,
      publicId: storageResult.publicId,
      fileName: file.sanitizedName || file.originalname,
      fileSize: storageResult.bytes || file.size,
      mimeType: file.mimetype,
      isDefault: true,
      isPrivate: false,
    });

    // Audit Log
    await AuditLog.create({
      userId: recruiterUser._id,
      action: 'FILE_UPLOADED',
      resource: 'Company',
      resourceId: company._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        type: DOCUMENT_TYPE.COMPANY_LOGO,
        companyId: company._id,
        fileName: document.fileName,
      },
    });

    return { document, company };
  }

  /**
   * 4. Upload Certificate (PDF, JPEG, PNG, max 5MB)
   */
  static async uploadCertificate(user, file, payload = {}, auditInfo = {}) {
    const { title = 'Certificate', issuer = '', issueDate } = payload;

    const storageResult = await StorageService.uploadBuffer(file.buffer, {
      folder: 'internhub/certificates',
      publicId: `cert-${user._id}`,
      format: file.mimetype.includes('pdf') ? 'pdf' : 'jpg',
    });

    const document = await Document.create({
      userId: user._id,
      title: title.trim(),
      type: DOCUMENT_TYPE.CERTIFICATE,
      fileUrl: storageResult.url,
      publicId: storageResult.publicId,
      fileName: file.sanitizedName || file.originalname,
      fileSize: storageResult.bytes || file.size,
      mimeType: file.mimetype,
      isDefault: false,
      isPrivate: true,
      metadata: { issuer, issueDate },
    });

    // Attach to student profile
    const profile = await StudentProfile.findOne({ userId: user._id });
    if (profile) {
      profile.certifications.push({
        name: title.trim(),
        issuer: issuer.trim() || 'Verified Institute',
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        credentialUrl: document.fileUrl,
      });
      await profile.save();
    }

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'FILE_UPLOADED',
      resource: 'Document',
      resourceId: document._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        type: DOCUMENT_TYPE.CERTIFICATE,
        fileName: document.fileName,
      },
    });

    return { document, profile };
  }

  /**
   * 5. Replace Document (deletes old asset in cloud storage + updates record)
   */
  static async replaceDocument(documentId, user, file, payload = {}, auditInfo = {}) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found.');
    }

    // Ownership check
    const isOwner = document.userId.toString() === user._id.toString();
    const isAdmin = user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You do not have permission to modify this document.');
    }

    // 1. Delete old asset in cloud storage
    await StorageService.deleteFile(document.publicId);

    // 2. Upload new buffer
    const storageResult = await StorageService.uploadBuffer(file.buffer, {
      folder: `internhub/${document.type.toLowerCase()}s`,
      publicId: `replaced-${user._id}`,
    });

    // 3. Update Document record
    document.fileUrl = storageResult.url;
    document.publicId = storageResult.publicId;
    document.fileName = file.sanitizedName || file.originalname;
    document.fileSize = storageResult.bytes || file.size;
    document.mimeType = file.mimetype;
    if (payload.title) {
      document.title = payload.title.trim();
    }
    await document.save();

    // 4. Sync profile if default resume
    if (document.type === DOCUMENT_TYPE.RESUME && document.isDefault) {
      await StudentProfile.findOneAndUpdate(
        { userId: document.userId },
        { resume: document.fileUrl }
      );
    }

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'FILE_REPLACED',
      resource: 'Document',
      resourceId: document._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        fileName: document.fileName,
        fileSize: document.fileSize,
      },
    });

    return document;
  }

  /**
   * 6. Delete Document (removes from cloud storage + drops MongoDB metadata)
   */
  static async deleteDocument(documentId, user, auditInfo = {}) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found.');
    }

    // Ownership check
    const isOwner = document.userId.toString() === user._id.toString();
    const isAdmin = user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You do not have permission to delete this document.');
    }

    // 1. Delete from cloud storage
    await StorageService.deleteFile(document.publicId);

    // 2. Delete metadata from MongoDB
    await Document.findByIdAndDelete(documentId);

    // 3. Update StudentProfile if resume was removed
    if (document.type === DOCUMENT_TYPE.RESUME) {
      const profile = await StudentProfile.findOne({ userId: document.userId });
      if (profile) {
        profile.resumes = profile.resumes.filter(
          (r) => r.publicId !== document.publicId && r.fileUrl !== document.fileUrl
        );
        if (profile.resume === document.fileUrl) {
          const nextDefault = profile.resumes.find((r) => r.isDefault) || profile.resumes[0];
          profile.resume = nextDefault ? nextDefault.fileUrl : '';
        }
        await profile.save();
      }
    }

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'FILE_DELETED',
      resource: 'Document',
      resourceId: document._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        type: document.type,
        fileName: document.fileName,
      },
    });

    return { success: true, message: 'Document deleted successfully.' };
  }

  /**
   * 7. Secure View / Download (IDOR & Access Control Guard)
   */
  static async getDocumentSecure(documentId, user, auditInfo = {}) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found.');
    }

    // Public documents (avatars, company logos) can be accessed by authenticated users
    if (!document.isPrivate) {
      return document;
    }

    const isOwner = document.userId.toString() === user._id.toString();
    const isAdmin = user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN;

    if (isOwner || isAdmin) {
      await AuditLog.create({
        userId: user._id,
        action: 'FILE_ACCESSED',
        resource: 'Document',
        resourceId: document._id,
        ipAddress: auditInfo.ipAddress || null,
        userAgent: auditInfo.userAgent || null,
      });
      return document;
    }

    // If user is a recruiter, verify whether the student applied to recruiter's company
    if (user.role === USER_ROLES.RECRUITER) {
      const company = await Company.findOne({ ownerId: user._id });
      if (company) {
        const hasApplied = await Application.exists({
          studentId: document.userId,
          companyId: company._id,
        });

        if (hasApplied) {
          await AuditLog.create({
            userId: user._id,
            action: 'FILE_ACCESSED',
            resource: 'Document',
            resourceId: document._id,
            ipAddress: auditInfo.ipAddress || null,
            userAgent: auditInfo.userAgent || null,
            metadata: {
              recruiterCompanyId: company._id,
              candidateStudentId: document.userId,
            },
          });
          return document;
        }
      }
    }

    // Unauthorized access attempt — block IDOR
    throw new ApiError(
      403,
      'Access denied: You do not have authorization to view this private document.'
    );
  }

  /**
   * 8. List User Documents with filter
   */
  static async getUserDocuments(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (queryParams.type && queryParams.type !== 'ALL') {
      filter.type = queryParams.type;
    }

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(filter),
    ]);

    return {
      data: documents,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export default DocumentService;
