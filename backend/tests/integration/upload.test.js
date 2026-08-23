import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { DocumentService } from '../../src/services/document.service.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import { DOCUMENT_TYPE } from '../../src/models/Document.model.js';

describe('Secure Production File Upload Integration Tests', () => {
  const studentId = new mongoose.Types.ObjectId().toString();
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const docId = new mongoose.Types.ObjectId().toString();

  let studentToken;
  let recruiterToken;

  beforeAll(() => {
    studentToken = generateAccessToken({
      id: studentId,
      role: USER_ROLES.STUDENT,
    });

    recruiterToken = generateAccessToken({
      id: recruiterId,
      role: USER_ROLES.RECRUITER,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/upload/resume', () => {
    it('successfully uploads valid student resume PDF (201)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(DocumentService, 'uploadResume').mockResolvedValue({
        document: {
          _id: docId,
          userId: studentId,
          title: 'Software Engineer Resume',
          type: DOCUMENT_TYPE.RESUME,
          fileUrl: 'https://storage.internhub.io/resumes/my-resume.pdf',
          publicId: 'internhub/resumes/resume-123',
          fileName: 'my_resume.pdf',
          fileSize: 10240,
          mimeType: 'application/pdf',
          isDefault: true,
        },
        profile: { resume: 'https://storage.internhub.io/resumes/my-resume.pdf' },
      });

      const res = await request(app)
        .post('/api/v1/upload/resume')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from('%PDF-1.4 mock pdf content'), 'my_resume.pdf')
        .field('title', 'Software Engineer Resume');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.document.fileUrl).toContain('.pdf');
    });

    it('rejects malicious executable / script upload (.exe, .js, .sh) with 400', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const res = await request(app)
        .post('/api/v1/upload/resume')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from('malicious shell script'), 'exploit.sh');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/blocked for security reasons|Invalid file extension/i);
    });

    it('rejects upload when student role permission is violated (403)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: recruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      const res = await request(app)
        .post('/api/v1/upload/resume')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .attach('file', Buffer.from('%PDF-1.4 mock pdf content'), 'resume.pdf');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/upload/avatar', () => {
    it('uploads user avatar image (201)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(DocumentService, 'uploadAvatar').mockResolvedValue({
        document: {
          _id: docId,
          fileUrl: 'https://storage.internhub.io/avatars/avatar.png',
        },
        user: { _id: studentId, avatar: 'https://storage.internhub.io/avatars/avatar.png' },
      });

      const res = await request(app)
        .post('/api/v1/upload/avatar')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'profile.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects unsupported avatar MIME type (.pdf instead of image)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const res = await request(app)
        .post('/api/v1/upload/avatar')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from('%PDF-1.4 content'), 'document.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid file extension|Invalid MIME type/i);
    });
  });

  describe('POST /api/v1/upload/company-logo', () => {
    it('allows recruiter to upload company logo (201)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: recruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      jest.spyOn(DocumentService, 'uploadCompanyLogo').mockResolvedValue({
        document: {
          _id: docId,
          fileUrl: 'https://storage.internhub.io/logos/logo.png',
        },
        company: { _id: 'comp123', logo: 'https://storage.internhub.io/logos/logo.png' },
      });

      const res = await request(app)
        .post('/api/v1/upload/company-logo')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .attach('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'logo.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('forbids students from uploading company logo (403)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const res = await request(app)
        .post('/api/v1/upload/company-logo')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'logo.png');

      expect(res.status).toBe(403);
    });
  });

  describe('Document Operations: Secure View & Delete', () => {
    it('gets document securely (200)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(DocumentService, 'getDocumentSecure').mockResolvedValue({
        _id: docId,
        userId: studentId,
        title: 'Resume',
        fileUrl: 'https://storage.internhub.io/resumes/my-resume.pdf',
      });

      const res = await request(app)
        .get(`/api/v1/upload/documents/${docId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('deletes document and returns success (200)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(DocumentService, 'deleteDocument').mockResolvedValue({
        success: true,
        message: 'Document deleted successfully.',
      });

      const res = await request(app)
        .delete(`/api/v1/upload/documents/${docId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
