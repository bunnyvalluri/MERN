import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { Application, APPLICATION_STATUS } from '../../src/models/Application.model.js';
import { Internship, INTERNSHIP_STATUS } from '../../src/models/Internship.model.js';
import { Company } from '../../src/models/Company.model.js';
import { Document, DOCUMENT_TYPE } from '../../src/models/Document.model.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Production Security & Exploit Mitigation Suite', () => {
  // Test Actor IDs
  const studentAliceId = new mongoose.Types.ObjectId().toString();
  const studentBobId = new mongoose.Types.ObjectId().toString();
  const recruiterAliceId = new mongoose.Types.ObjectId().toString();
  const recruiterBobId = new mongoose.Types.ObjectId().toString();
  const companyAliceId = new mongoose.Types.ObjectId().toString();
  const companyBobId = new mongoose.Types.ObjectId().toString();
  const internshipAliceId = new mongoose.Types.ObjectId().toString();
  const applicationAliceId = new mongoose.Types.ObjectId().toString();
  const documentAliceId = new mongoose.Types.ObjectId().toString();

  let studentAliceToken;
  let studentBobToken;
  let recruiterAliceToken;
  let recruiterBobToken;

  beforeAll(() => {
    studentAliceToken = generateAccessToken({ id: studentAliceId, role: USER_ROLES.STUDENT });
    studentBobToken = generateAccessToken({ id: studentBobId, role: USER_ROLES.STUDENT });
    recruiterAliceToken = generateAccessToken({ id: recruiterAliceId, role: USER_ROLES.RECRUITER });
    recruiterBobToken = generateAccessToken({ id: recruiterBobId, role: USER_ROLES.RECRUITER });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 1. Access Another Student's Application (IDOR Attack) ─────────────────
  describe('Vector 1: IDOR on Student Application', () => {
    it('blocks Student Bob from viewing Student Alice application (404 data isolation)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentBobId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      // Application not found for student Bob (IDOR prevention)
      const queryMock = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(Application, 'findOne').mockReturnValue(queryMock);

      const res = await request(app)
        .get(`/api/v1/applications/${applicationAliceId}`)
        .set('Authorization', `Bearer ${studentBobToken}`);

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 2. Modify Another Recruiter's Internship (Ownership IDOR) ─────────────
  describe("Vector 2: Modify Another Recruiter's Internship", () => {
    it('blocks Recruiter Bob from modifying Recruiter Alice internship (403)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: recruiterBobId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      jest.spyOn(Internship, 'findById').mockResolvedValue({
        _id: internshipAliceId,
        companyId: companyAliceId,
        title: 'Alice Internship',
        createdBy: recruiterAliceId,
      });

      // Recruiter Bob does not own Company Alice
      jest.spyOn(Company, 'findById').mockResolvedValue({
        _id: companyAliceId,
        ownerId: recruiterAliceId,
      });

      const res = await request(app)
        .put(`/api/v1/recruiter/internships/${internshipAliceId}`)
        .set('Authorization', `Bearer ${recruiterBobToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });
  });

  // ─── 3. Access Admin Endpoints as Student (RBAC Privilege Escalation) ──────
  describe('Vector 3: Access Admin Endpoints as Student', () => {
    it('rejects student attempting to access /api/v1/admin/metrics (403)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentAliceId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${studentAliceToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access forbidden: Role 'STUDENT'/i);
    });
  });

  // ─── 4. Change Role Through Registration (Mass Assignment) ─────────────────
  describe('Vector 4: Privilege Escalation on Registration', () => {
    it('blocks user from registering as ADMIN (400/403)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker',
          email: 'hacker@test.com',
          password: 'Password123!',
          role: 'ADMIN',
        });

      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 5. Modify Application Status as Student (Unauthorized State Change) ───
  describe('Vector 5: Student Modifying Application Status', () => {
    it('blocks student token from changing application status to SELECTED (403)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentAliceId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const res = await request(app)
        .patch(`/api/v1/applications/recruiter/${applicationAliceId}/status`)
        .set('Authorization', `Bearer ${studentAliceToken}`)
        .send({ status: 'SELECTED' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 6. Upload Malicious Files (Executable / Shell Script Rejection) ────────
  describe('Vector 6: Malicious File Upload', () => {
    it('rejects executable script files (.sh, .exe, .js) with 400 Bad Request', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentAliceId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const res = await request(app)
        .post('/api/v1/upload/resume')
        .set('Authorization', `Bearer ${studentAliceToken}`)
        .attach('file', Buffer.from('#!/bin/bash\necho exploit'), 'malicious_script.sh');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/blocked for security reasons|Invalid file extension/i);
    });
  });

  // ─── 7. Validation Bypass & Injection Payloads ─────────────────────────────
  describe('Vector 7: Schema Validation Enforcement', () => {
    it('rejects registration with invalid email syntax (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alice',
          email: 'invalid-email-address',
          password: 'Password123!',
          role: 'STUDENT',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validation/i);
    });
  });

  // ─── 8. Expired & Invalid JWT Tokens ───────────────────────────────────────
  describe('Vector 8: Expired & Forged JWT Tokens', () => {
    it('rejects request with forged / invalid JWT token (401)', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer forged.invalid.token.signature');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token/i);
    });
  });

  // ─── 9. Access Private Documents (Document IDOR Guard) ─────────────────────
  describe('Vector 9: Private Document Access Control', () => {
    it('blocks Student Bob from downloading Student Alice private resume (403)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentBobId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(Document, 'findById').mockResolvedValue({
        _id: documentAliceId,
        userId: studentAliceId,
        type: DOCUMENT_TYPE.RESUME,
        isPrivate: true,
        fileUrl: 'https://storage.internhub.io/resumes/alice.pdf',
      });

      const res = await request(app)
        .get(`/api/v1/upload/documents/${documentAliceId}`)
        .set('Authorization', `Bearer ${studentBobToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });
  });

  // ─── 10. Manipulate URL IDs & Malformed ObjectIds ──────────────────────────
  describe('Vector 10: URL ID Manipulation (CastError Handling)', () => {
    it('returns clean 404 or 400 on non-existent or invalid ID without server crash', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: studentAliceId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(Internship, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      const res = await request(app)
        .get('/api/v1/internships/nonexistent-opportunity-slug-123');

      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });
});
