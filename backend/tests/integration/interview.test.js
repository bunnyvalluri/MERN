import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { InterviewService } from '../../src/services/interview.service.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import { INTERVIEW_STATUS } from '../../src/models/Interview.model.js';

describe('Interview Management Integration Tests', () => {
  const mockStudentId = new mongoose.Types.ObjectId().toString();
  const mockRecruiterId = new mongoose.Types.ObjectId().toString();
  const mockOtherStudentId = new mongoose.Types.ObjectId().toString();
  const mockInterviewId = new mongoose.Types.ObjectId().toString();
  const mockApplicationId = new mongoose.Types.ObjectId().toString();

  let studentToken;
  let recruiterToken;
  let otherStudentToken;

  beforeAll(() => {
    studentToken = generateAccessToken({
      id: mockStudentId,
      role: USER_ROLES.STUDENT,
    });
    recruiterToken = generateAccessToken({
      id: mockRecruiterId,
      role: USER_ROLES.RECRUITER,
    });
    otherStudentToken = generateAccessToken({
      id: mockOtherStudentId,
      role: USER_ROLES.STUDENT,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/interviews (Schedule Interview)', () => {
    it('successfully schedules an interview and notifies student', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      jest.spyOn(InterviewService, 'scheduleInterview').mockResolvedValue({
        _id: mockInterviewId,
        applicationId: mockApplicationId,
        studentId: { _id: mockStudentId, name: 'Alice Student' },
        scheduledAt: futureDate.toISOString(),
        durationMinutes: 45,
        type: 'VIDEO',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        status: INTERVIEW_STATUS.SCHEDULED,
      });

      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          applicationId: mockApplicationId,
          scheduledAt: futureDate.toISOString(),
          durationMinutes: 45,
          type: 'VIDEO',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          notes: 'Please prepare to discuss system design.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(INTERVIEW_STATUS.SCHEDULED);
      expect(res.body.data.meetingLink).toBe('https://meet.google.com/abc-defg-hij');
    });

    it('rejects scheduling when student attempts it (Forbidden)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          applicationId: mockApplicationId,
          scheduledAt: futureDate.toISOString(),
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/interviews/:id/reschedule', () => {
    it('reschedules an active interview with a new future date', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 5);

      jest.spyOn(InterviewService, 'rescheduleInterview').mockResolvedValue({
        _id: mockInterviewId,
        scheduledAt: newDate.toISOString(),
        status: INTERVIEW_STATUS.RESCHEDULED,
        meetingLink: 'https://meet.google.com/new-link',
      });

      const res = await request(app)
        .patch(`/api/v1/interviews/${mockInterviewId}/reschedule`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          scheduledAt: newDate.toISOString(),
          reason: 'Interviewer conflict',
          meetingUrl: 'https://meet.google.com/new-link',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(INTERVIEW_STATUS.RESCHEDULED);
    });
  });

  describe('PATCH /api/v1/interviews/:id/cancel', () => {
    it('cancels an interview with reason', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockRecruiterId,
          role: USER_ROLES.RECRUITER,
          isActive: true,
        }),
      });

      jest.spyOn(InterviewService, 'cancelInterview').mockResolvedValue({
        _id: mockInterviewId,
        status: INTERVIEW_STATUS.CANCELLED,
      });

      const res = await request(app)
        .patch(`/api/v1/interviews/${mockInterviewId}/cancel`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          reason: 'Role has been filled internally',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(INTERVIEW_STATUS.CANCELLED);
    });
  });

  describe('GET /api/v1/interviews/student/me', () => {
    it('retrieves student scheduled interviews', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(InterviewService, 'getStudentInterviews').mockResolvedValue({
        data: [
          {
            _id: mockInterviewId,
            scheduledAt: new Date().toISOString(),
            status: INTERVIEW_STATUS.SCHEDULED,
            meetingLink: 'https://meet.google.com/abc',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        upcomingCount: 1,
        pastCount: 0,
      });

      const res = await request(app)
        .get('/api/v1/interviews/student/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.upcomingCount).toBe(1);
    });
  });

  describe('GET /api/v1/interviews/:id (Single Interview Access)', () => {
    it('allows participant student to retrieve interview details', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockStudentId,
          role: USER_ROLES.STUDENT,
          isActive: true,
        }),
      });

      jest.spyOn(InterviewService, 'getInterviewById').mockResolvedValue({
        _id: mockInterviewId,
        studentId: { _id: mockStudentId, name: 'Alice Student' },
        scheduledAt: new Date().toISOString(),
        meetingLink: 'https://meet.google.com/abc',
        status: INTERVIEW_STATUS.SCHEDULED,
      });

      const res = await request(app)
        .get(`/api/v1/interviews/${mockInterviewId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.meetingLink).toBe('https://meet.google.com/abc');
    });
  });
});
