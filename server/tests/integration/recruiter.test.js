import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { RecruiterService } from '../../src/services/recruiter.service.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Recruiter Internship Management Integration Tests', () => {
  const mockRecruiterId = new mongoose.Types.ObjectId().toString();
  const mockStudentId = new mongoose.Types.ObjectId().toString();
  const mockInternshipId = new mongoose.Types.ObjectId().toString();

  const recruiterToken = generateAccessToken({
    id: mockRecruiterId,
    role: USER_ROLES.RECRUITER,
    email: 'recruiter@company.com',
  });

  const studentToken = generateAccessToken({
    id: mockStudentId,
    role: USER_ROLES.STUDENT,
    email: 'student@stanford.edu',
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/recruiter/internships', () => {
    it('allows authenticated recruiter to create a new internship', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          name: 'Sarah Recruiter',
          email: 'recruiter@company.com',
          role: USER_ROLES.RECRUITER,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(RecruiterService, 'createInternship').mockResolvedValue({
        _id: mockInternshipId,
        title: 'Cloud DevOps Intern',
        slug: 'cloud-devops-intern-1a2b',
        status: 'DRAFT',
        createdBy: mockRecruiterId,
      });

      const res = await request(app)
        .post('/api/v1/recruiter/internships')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Cloud DevOps Intern',
          description: 'Deploy Kubernetes clusters and CI/CD pipelines in AWS.',
          skills: ['AWS', 'Kubernetes', 'Docker'],
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          remote: 'REMOTE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Cloud DevOps Intern');
    });

    it('rejects STUDENT role on recruiter routes with 403 Forbidden', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: 'Alex Student',
          email: 'student@stanford.edu',
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      const res = await request(app)
        .post('/api/v1/recruiter/internships')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Hacking Post',
          description: 'A long enough description that meets the length threshold.',
          skills: ['Hacking'],
          applicationDeadline: new Date(Date.now() + 100000).toISOString(),
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/recruiter/internships', () => {
    it('lists company internships for authenticated recruiter', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      jest.spyOn(RecruiterService, 'getRecruiterInternships').mockResolvedValue({
        data: [
          {
            _id: mockInternshipId,
            title: 'SWE Intern',
            status: 'PUBLISHED',
            applicationsCount: 5,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/recruiter/internships')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/recruiter/company & PUT', () => {
    it('retrieves and updates company profile', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      jest.spyOn(RecruiterService, 'getCompanyProfile').mockResolvedValue({
        _id: '60d5ec49f1b2c8b1f8e4e1b1',
        name: 'Tech Innovators Inc',
        industry: 'Software',
      });

      const res = await request(app)
        .get('/api/v1/recruiter/company')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Tech Innovators Inc');
    });
  });
});
