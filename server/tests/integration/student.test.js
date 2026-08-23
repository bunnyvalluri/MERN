import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { StudentService } from '../../src/services/student.service.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Student Routes Integration Tests', () => {
  const mockStudentId = new mongoose.Types.ObjectId().toString();
  const mockRecruiterId = new mongoose.Types.ObjectId().toString();

  const studentToken = generateAccessToken({
    id: mockStudentId,
    role: USER_ROLES.STUDENT,
    email: 'student@stanford.edu',
  });

  const recruiterToken = generateAccessToken({
    id: mockRecruiterId,
    role: USER_ROLES.RECRUITER,
    email: 'recruiter@company.com',
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/students/me', () => {
    it('returns student profile and dynamic completion metric for authenticated student', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: 'Sarah Jenkins',
          email: 'student@stanford.edu',
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(StudentService, 'getOwnProfile').mockResolvedValue({
        user: { _id: mockStudentId, name: 'Sarah Jenkins', email: 'student@stanford.edu' },
        profile: { headline: 'SWE Intern', skills: ['React', 'Node.js'] },
        completion: { percentage: 60, breakdown: {}, nextSteps: [] },
      });

      const res = await request(app)
        .get('/api/v1/students/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.completion.percentage).toBe(60);
    });

    it('rejects RECRUITER token on student-only route with 403 Forbidden', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          name: 'Recruiter Bob',
          email: 'recruiter@company.com',
          role: USER_ROLES.RECRUITER,
          isActive: true,
          isVerified: true,
        }),
      });

      const res = await request(app)
        .get('/api/v1/students/me')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/students/me', () => {
    it('updates profile and recalculates completion', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: 'Sarah Jenkins',
          email: 'student@stanford.edu',
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(StudentService, 'updateOwnProfile').mockResolvedValue({
        user: { _id: mockStudentId, name: 'Sarah Jenkins' },
        profile: { headline: 'Updated Headline', skills: ['React', 'TypeScript', 'Node.js'] },
        completion: { percentage: 70, breakdown: {}, nextSteps: [] },
      });

      const res = await request(app)
        .put('/api/v1/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          headline: 'Updated Headline',
          skills: ['React', 'TypeScript', 'Node.js'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.headline).toBe('Updated Headline');
    });
  });

  describe('POST /api/v1/students/me/resume & DELETE', () => {
    it('successfully uploads resume and updates completion score', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(StudentService, 'updateResume').mockResolvedValue({
        resume: { url: 'https://cloudinary.com/new_resume.pdf', fileName: 'new_resume.pdf' },
        completion: { percentage: 80, breakdown: {}, nextSteps: [] },
      });

      const res = await request(app)
        .post('/api/v1/students/me/resume')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          url: 'https://cloudinary.com/new_resume.pdf',
          fileName: 'new_resume.pdf',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('successfully deletes resume', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(StudentService, 'deleteResume').mockResolvedValue({
        completion: { percentage: 70, breakdown: {}, nextSteps: [] },
      });

      const res = await request(app)
        .delete('/api/v1/students/me/resume')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
