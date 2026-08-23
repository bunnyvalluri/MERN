import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { ApplicationService } from '../../src/services/application.service.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { APPLICATION_STATUS } from '../../src/models/Application.model.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import { ApiError } from '../../src/utils/ApiError.js';

describe('Application Workflow Integration Tests', () => {
  const mockStudentId = new mongoose.Types.ObjectId().toString();
  const mockRecruiterId = new mongoose.Types.ObjectId().toString();
  const mockInternshipId = new mongoose.Types.ObjectId().toString();
  const mockApplicationId = new mongoose.Types.ObjectId().toString();

  const studentToken = generateAccessToken({
    id: mockStudentId,
    role: USER_ROLES.STUDENT,
    email: 'student@stanford.edu',
  });

  const recruiterToken = generateAccessToken({
    id: mockRecruiterId,
    role: USER_ROLES.RECRUITER,
    email: 'recruiter@techcorp.com',
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/applications (Student Apply)', () => {
    it('successfully submits an application and records initial timeline entry', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: 'Alex Johnson',
          email: 'student@stanford.edu',
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(ApplicationService, 'applyToInternship').mockResolvedValue({
        _id: mockApplicationId,
        studentId: mockStudentId,
        internshipId: {
          _id: mockInternshipId,
          title: 'Full Stack Engineering Intern',
        },
        status: APPLICATION_STATUS.APPLIED,
        timeline: [
          {
            status: APPLICATION_STATUS.APPLIED,
            changedAt: new Date(),
            note: 'Application submitted successfully',
          },
        ],
      });

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          internshipId: mockInternshipId,
          coverLetter: 'I am excited about this role and have experience in React and Node.js.',
          resume: {
            url: 'https://cdn.internhub.com/resumes/alex-resume.pdf',
            fileName: 'Alex_Johnson_Resume.pdf',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(APPLICATION_STATUS.APPLIED);
      expect(res.body.data.timeline).toHaveLength(1);
    });

    it('rejects duplicate application with 409 Conflict', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: 'Alex Johnson',
          email: 'student@stanford.edu',
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(ApplicationService, 'applyToInternship').mockRejectedValue(
        new ApiError(409, 'You have already submitted an application to this internship.')
      );

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          internshipId: mockInternshipId,
          coverLetter: 'Second attempt',
          resume: {
            url: 'https://cdn.internhub.com/resumes/alex-resume.pdf',
            fileName: 'Alex_Johnson_Resume.pdf',
          },
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already submitted');
    });

    it('rejects application to closed internship with 400 Bad Request', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          name: 'Alex Johnson',
          email: 'student@stanford.edu',
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(ApplicationService, 'applyToInternship').mockRejectedValue(
        new ApiError(400, 'Cannot apply to an internship that is currently closed.')
      );

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          internshipId: mockInternshipId,
          resume: {
            url: 'https://cdn.internhub.com/resumes/alex-resume.pdf',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('closed');
    });

    it('rejects recruiter from applying with 403 Forbidden', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
          isVerified: true,
        }),
      });

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          internshipId: mockInternshipId,
          resume: {
            url: 'https://cdn.internhub.com/resumes/recruiter-resume.pdf',
          },
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/applications/me (Student Applications)', () => {
    it('returns student applications list with timeline and status', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(ApplicationService, 'getStudentApplications').mockResolvedValue({
        data: [
          {
            _id: mockApplicationId,
            status: APPLICATION_STATUS.UNDER_REVIEW,
            internshipId: { title: 'Backend Intern' },
            companyId: { name: 'Acme Corp' },
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/applications/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
    });
  });

  describe('PATCH /api/v1/applications/:id/withdraw (Student Withdraw)', () => {
    it('allows student to withdraw application', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(ApplicationService, 'withdrawApplication').mockResolvedValue({
        _id: mockApplicationId,
        status: APPLICATION_STATUS.WITHDRAWN,
      });

      const res = await request(app)
        .patch(`/api/v1/applications/${mockApplicationId}/withdraw`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ note: 'Accepted an offer elsewhere.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(APPLICATION_STATUS.WITHDRAWN);
    });
  });

  describe('Recruiter Application Management Routes', () => {
    it('retrieves all company applications for recruiter', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(ApplicationService, 'getRecruiterApplications').mockResolvedValue({
        data: [
          {
            _id: mockApplicationId,
            status: APPLICATION_STATUS.APPLIED,
            studentId: { name: 'Alex Johnson', email: 'alex@stanford.edu' },
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        stats: { total: 1, applied: 1 },
      });

      const res = await request(app)
        .get('/api/v1/applications/recruiter/all')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
    });

    it('updates candidate application status (e.g. SHORTLISTED)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
          isVerified: true,
        }),
      });

      jest.spyOn(ApplicationService, 'updateApplicationStatus').mockResolvedValue({
        _id: mockApplicationId,
        status: APPLICATION_STATUS.SHORTLISTED,
      });

      const res = await request(app)
        .patch(`/api/v1/applications/recruiter/${mockApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: APPLICATION_STATUS.SHORTLISTED,
          note: 'Strong portfolio and relevant project experience',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(APPLICATION_STATUS.SHORTLISTED);
    });

    it('schedules an interview for a candidate', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
          isVerified: true,
        }),
      });

      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      jest.spyOn(ApplicationService, 'scheduleInterview').mockResolvedValue({
        application: {
          _id: mockApplicationId,
          status: APPLICATION_STATUS.INTERVIEW,
        },
        interview: {
          scheduledAt: futureDate,
          type: 'VIDEO',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
        },
      });

      const res = await request(app)
        .post(`/api/v1/applications/recruiter/${mockApplicationId}/schedule-interview`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          scheduledAt: futureDate,
          durationMinutes: 45,
          type: 'VIDEO',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          interviewer: {
            name: 'Sarah Lead',
            email: 'lead@techcorp.com',
          },
          notes: 'Technical coding interview on data structures and system design.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.status).toBe(APPLICATION_STATUS.INTERVIEW);
    });
  });
});
