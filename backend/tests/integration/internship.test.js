import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { InternshipService } from '../../src/services/internship.service.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Internship Discovery & Bookmarks Integration Tests', () => {
  const mockStudentId = new mongoose.Types.ObjectId().toString();
  const mockInternshipId = new mongoose.Types.ObjectId().toString();

  const studentToken = generateAccessToken({
    id: mockStudentId,
    role: USER_ROLES.STUDENT,
    email: 'student@stanford.edu',
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/internships', () => {
    it('returns 200 with paginated internship listings', async () => {
      jest.spyOn(InternshipService, 'getInternships').mockResolvedValue({
        data: [
          {
            _id: mockInternshipId,
            title: 'Frontend Engineer Intern',
            companyId: { name: 'Vercel', verified: true },
            remote: 'REMOTE',
            stipend: { amount: 2500, period: 'MONTH' },
            skills: ['React', 'TypeScript'],
            isSaved: false,
          },
        ],
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app).get('/api/v1/internships?search=react&remote=REMOTE');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(12);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.totalPages).toBe(1);
    });

    it('rejects requests with invalid limit exceeding max allowable page size with 400 Bad Request', async () => {
      const res = await request(app).get('/api/v1/internships?limit=999');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/internships/:id', () => {
    it('returns single internship opportunity details', async () => {
      jest.spyOn(InternshipService, 'getInternshipById').mockResolvedValue({
        internship: {
          _id: mockInternshipId,
          title: 'Full Stack Engineering Intern',
          companyId: { name: 'Stripe', website: 'https://stripe.com', verified: true },
          description: 'Build developer payment infrastructure.',
          responsibilities: ['Build APIs', 'Write tests'],
          requirements: ['Knowledge of Node.js', 'React'],
          skills: ['Node.js', 'React', 'MongoDB'],
          viewsCount: 42,
        },
        isSaved: true,
        hasApplied: false,
      });

      const res = await request(app).get(`/api/v1/internships/${mockInternshipId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.internship.title).toBe('Full Stack Engineering Intern');
      expect(res.body.data.isSaved).toBe(true);
    });
  });

  describe('POST /api/v1/internships/:id/save (Bookmark Toggle)', () => {
    it('toggles bookmark save state for authenticated student', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(InternshipService, 'toggleSaveInternship').mockResolvedValue({
        isSaved: true,
        message: 'Internship saved to your bookmarks.',
      });

      const res = await request(app)
        .post(`/api/v1/internships/${mockInternshipId}/save`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isSaved).toBe(true);
    });

    it('rejects unauthenticated save attempts with 401 Unauthorized', async () => {
      const res = await request(app).post(`/api/v1/internships/${mockInternshipId}/save`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/internships/saved', () => {
    it('returns saved bookmarks for student', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(InternshipService, 'getSavedInternships').mockResolvedValue({
        data: [
          {
            _id: mockInternshipId,
            title: 'AI Engineering Intern',
            companyId: { name: 'OpenAI' },
            isSaved: true,
          },
        ],
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/internships/saved')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
    });
  });
});
