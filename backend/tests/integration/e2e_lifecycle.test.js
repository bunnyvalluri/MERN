import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { User, USER_ROLES } from '../../src/models/User.model.js';
import { AuthService } from '../../src/services/auth.service.js';
import { StudentService } from '../../src/services/student.service.js';
import { InternshipService } from '../../src/services/internship.service.js';
import { ApplicationService } from '../../src/services/application.service.js';
import { RecruiterService } from '../../src/services/recruiter.service.js';
import { InterviewService } from '../../src/services/interview.service.js';
import { NotificationService } from '../../src/services/notification.service.js';
import { AdminService } from '../../src/services/admin.service.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import { APPLICATION_STATUS } from '../../src/models/Application.model.js';
import { INTERNSHIP_STATUS } from '../../src/models/Internship.model.js';
import { INTERVIEW_STATUS } from '../../src/models/Interview.model.js';

describe('End-to-End Full Platform Lifecycle Test Suite', () => {
  // Shared Test Entities
  const studentId = new mongoose.Types.ObjectId().toString();
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  const companyId = new mongoose.Types.ObjectId().toString();
  const internshipId = new mongoose.Types.ObjectId().toString();
  const applicationId = new mongoose.Types.ObjectId().toString();
  const interviewId = new mongoose.Types.ObjectId().toString();

  let studentToken;
  let recruiterToken;
  let adminToken;

  beforeAll(() => {
    studentToken = generateAccessToken({ id: studentId, role: USER_ROLES.STUDENT });
    recruiterToken = generateAccessToken({ id: recruiterId, role: USER_ROLES.RECRUITER });
    adminToken = generateAccessToken({ id: adminId, role: USER_ROLES.ADMIN });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for User.findById authentication
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const idStr = id?.toString();
      let role = USER_ROLES.STUDENT;
      let name = 'Sarah Student';
      let email = 'sarah@student.edu';
      if (idStr === recruiterId) {
        role = USER_ROLES.RECRUITER;
        name = 'Rachel Recruiter';
        email = 'rachel@acme.com';
      } else if (idStr === adminId) {
        role = USER_ROLES.ADMIN;
        name = 'System Admin';
        email = 'admin@internhub.com';
      }
      const userObj = {
        _id: idStr || studentId,
        name,
        email,
        role,
        isActive: true,
        isVerified: true,
        save: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ _id: idStr || studentId, name, email, role, isActive: true }),
      };
      return {
        select: jest.fn().mockResolvedValue(userObj),
      };
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. COMPLETE STUDENT E2E LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1. Student End-to-End Workflow', () => {
    it('Step 1.1: Register Student Account (POST /api/v1/auth/register)', async () => {
      jest.spyOn(AuthService, 'registerUser').mockResolvedValue({
        user: { _id: studentId, name: 'Sarah Student', email: 'sarah@student.edu', role: 'STUDENT' },
        accessToken: 'mock_jwt_access_token',
        refreshToken: 'mock_jwt_refresh_token',
        verificationToken: 'mock_verify_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Sarah Student',
          email: 'sarah@student.edu',
          password: 'Password123!',
          role: 'STUDENT',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('sarah@student.edu');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('Step 1.2: Login Student (POST /api/v1/auth/login)', async () => {
      jest.spyOn(AuthService, 'loginUser').mockResolvedValue({
        user: { _id: studentId, name: 'Sarah Student', email: 'sarah@student.edu', role: 'STUDENT' },
        accessToken: 'mock_logged_in_access_token',
        refreshToken: 'mock_logged_in_refresh_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'sarah@student.edu',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('Step 1.3: Complete Profile (PUT /api/v1/students/me)', async () => {
      jest.spyOn(StudentService, 'updateOwnProfile').mockResolvedValue({
        user: { _id: studentId, name: 'Sarah Student' },
        profile: {
          headline: 'Frontend Engineer Intern',
          bio: 'Passionate computer science student experienced in React, TypeScript, and Tailwind CSS.',
          skills: ['React', 'JavaScript', 'Node.js'],
        },
        completion: { percentage: 75, breakdown: {}, nextSteps: [] },
      });

      const res = await request(app)
        .put('/api/v1/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          headline: 'Frontend Engineer Intern',
          bio: 'Passionate computer science student experienced in React, TypeScript, and Tailwind CSS.',
          skills: ['React', 'JavaScript', 'Node.js'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.completion.percentage).toBe(75);
    });

    it('Step 1.4: Search Published Internships (GET /api/v1/internships)', async () => {
      jest.spyOn(InternshipService, 'getInternships').mockResolvedValue({
        data: [
          {
            _id: internshipId,
            title: 'Frontend React Intern',
            slug: 'frontend-react-intern',
            companyId: { name: 'Acme Corp', slug: 'acme-corp' },
            status: INTERNSHIP_STATUS.PUBLISHED,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/internships?search=React');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.data[0].title).toBe('Frontend React Intern');
    });

    it('Step 1.5: Save Internship Bookmark (POST /api/v1/internships/:id/save)', async () => {
      jest.spyOn(InternshipService, 'toggleSaveInternship').mockResolvedValue({
        isSaved: true,
        message: 'Internship saved to your bookmarks.',
      });

      const res = await request(app)
        .post(`/api/v1/internships/${internshipId}/save`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isSaved).toBe(true);
    });

    it('Step 1.6: Apply to Internship (POST /api/v1/applications)', async () => {
      jest.spyOn(ApplicationService, 'applyToInternship').mockResolvedValue({
        _id: applicationId,
        internshipId,
        studentId,
        companyId,
        status: APPLICATION_STATUS.APPLIED,
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          internshipId,
          coverLetter: 'I am excited to apply for the Frontend React Intern role at Acme Corp.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPLIED');
    });

    it('Step 1.7: View Application Details (GET /api/v1/applications/:id)', async () => {
      jest.spyOn(ApplicationService, 'getStudentApplicationById').mockResolvedValue({
        _id: applicationId,
        studentId,
        internshipId: { title: 'Frontend React Intern', status: 'PUBLISHED' },
        companyId: { name: 'Acme Corp' },
        status: APPLICATION_STATUS.APPLIED,
        timeline: [
          { status: APPLICATION_STATUS.APPLIED, changedAt: new Date(), notes: 'Application submitted' },
        ],
      });

      const res = await request(app)
        .get(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPLIED');
      expect(res.body.data.timeline.length).toBe(1);
    });

    it('Step 1.8: Receive Notification (GET /api/v1/notifications)', async () => {
      jest.spyOn(NotificationService, 'getUserNotifications').mockResolvedValue({
        data: [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            userId: studentId,
            title: 'Application Submitted',
            message: 'Your application for Frontend React Intern has been submitted.',
            type: 'APPLICATION_SUBMITTED',
            read: false,
            createdAt: new Date(),
          },
        ],
        page: 1,
        limit: 15,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.data[0].type).toBe('APPLICATION_SUBMITTED');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. COMPLETE RECRUITER E2E LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2. Recruiter End-to-End Workflow', () => {
    it('Step 2.1: Login Recruiter (POST /api/v1/auth/login)', async () => {
      jest.spyOn(AuthService, 'loginUser').mockResolvedValue({
        user: { _id: recruiterId, name: 'Rachel Recruiter', email: 'rachel@acme.com', role: 'RECRUITER' },
        accessToken: 'mock_recruiter_access_token',
        refreshToken: 'mock_recruiter_refresh_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'rachel@acme.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('RECRUITER');
    });

    it('Step 2.2: Create / Update Company Profile (PUT /api/v1/recruiter/company)', async () => {
      jest.spyOn(RecruiterService, 'updateCompanyProfile').mockResolvedValue({
        _id: companyId,
        ownerId: recruiterId,
        name: 'Acme Technologies',
        industry: 'Technology',
        description: 'Leading software engineering company developing modern cloud tools.',
        website: 'https://acme.com',
        verified: false,
      });

      const res = await request(app)
        .put('/api/v1/recruiter/company')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          name: 'Acme Technologies',
          industry: 'Technology',
          description: 'Leading software engineering company developing modern cloud tools.',
          website: 'https://acme.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Acme Technologies');
    });

    it('Step 2.3: Create Internship Posting (POST /api/v1/recruiter/internships)', async () => {
      jest.spyOn(RecruiterService, 'createInternship').mockResolvedValue({
        _id: internshipId,
        companyId,
        createdBy: recruiterId,
        title: 'Senior Node.js Intern',
        slug: 'senior-nodejs-intern',
        description: 'Work with our backend architecture team building microservices and REST APIs.',
        skills: ['Node.js', 'Express', 'MongoDB'],
        status: INTERNSHIP_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 86400000 * 45),
      });

      const res = await request(app)
        .post('/api/v1/recruiter/internships')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Senior Node.js Intern',
          description: 'Work with our backend architecture team building microservices and REST APIs.',
          skills: ['Node.js', 'Express', 'MongoDB'],
          applicationDeadline: new Date(Date.now() + 86400000 * 45).toISOString(),
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Senior Node.js Intern');
    });

    it('Step 2.4: View Applicants for Company (GET /api/v1/applications/recruiter/all)', async () => {
      jest.spyOn(ApplicationService, 'getRecruiterApplications').mockResolvedValue({
        data: [
          {
            _id: applicationId,
            studentId: { name: 'Sarah Student', email: 'sarah@student.edu' },
            internshipId: { title: 'Senior Node.js Intern' },
            status: APPLICATION_STATUS.APPLIED,
            createdAt: new Date(),
          },
        ],
        page: 1,
        limit: 15,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/applications/recruiter/all')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBe(1);
    });

    it('Step 2.5: Shortlist Candidate (PATCH /api/v1/applications/recruiter/:id/status)', async () => {
      jest.spyOn(ApplicationService, 'updateApplicationStatus').mockResolvedValue({
        _id: applicationId,
        status: APPLICATION_STATUS.SHORTLISTED,
        studentId,
        companyId,
      });

      const res = await request(app)
        .patch(`/api/v1/applications/recruiter/${applicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'SHORTLISTED',
          notes: 'Candidate has strong Node.js experience.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SHORTLISTED');
    });

    it('Step 2.6: Schedule Interview (POST /api/v1/interviews)', async () => {
      const scheduledTime = new Date(Date.now() + 86400000 * 3).toISOString();

      jest.spyOn(InterviewService, 'scheduleInterview').mockResolvedValue({
        _id: interviewId,
        applicationId,
        studentId,
        recruiterId,
        companyId,
        internshipId,
        scheduledAt: scheduledTime,
        duration: 45,
        meetingUrl: 'https://meet.google.com/xyz-abc-def',
        status: INTERVIEW_STATUS.SCHEDULED,
      });

      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          applicationId,
          scheduledAt: scheduledTime,
          duration: 45,
          meetingUrl: 'https://meet.google.com/xyz-abc-def',
          notes: 'Technical coding interview covering system design and REST APIs.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SCHEDULED');
      expect(res.body.data.duration).toBe(45);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. COMPLETE ADMIN E2E LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════
  describe('3. Admin End-to-End Workflow', () => {
    it('Step 3.1: Login Administrator (POST /api/v1/auth/login)', async () => {
      jest.spyOn(AuthService, 'loginUser').mockResolvedValue({
        user: { _id: adminId, name: 'System Admin', email: 'admin@internhub.com', role: 'ADMIN' },
        accessToken: 'mock_admin_access_token',
        refreshToken: 'mock_admin_refresh_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@internhub.com',
          password: 'AdminPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('Step 3.2: View Real-Time MongoDB Metrics (GET /api/v1/admin/metrics)', async () => {
      jest.spyOn(AdminService, 'getDashboardMetrics').mockResolvedValue({
        metrics: {
          totalUsers: 100,
          activeUsers: 95,
          studentsCount: 75,
          recruitersCount: 20,
          companiesCount: 25,
          internshipsCount: 50,
          applicationsCount: 200,
          pendingApprovals: 5,
        },
        charts: { userGrowth: [], statusDistribution: [] },
        recentLogs: [],
      });

      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.totalUsers).toBe(100);
      expect(res.body.data.metrics.companiesCount).toBe(25);
    });

    it('Step 3.3: Manage User Account Status (PATCH /api/v1/admin/users/:id/status)', async () => {
      jest.spyOn(AdminService, 'updateUserStatus').mockResolvedValue({
        success: true,
        message: 'User was successfully deactivated.',
        user: { _id: studentId, name: 'Sarah Student', isActive: false },
      });

      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.isActive).toBe(false);
    });

    it('Step 3.4: Verify Organization (PATCH /api/v1/admin/companies/:id/verify)', async () => {
      jest.spyOn(AdminService, 'verifyCompany').mockResolvedValue({
        success: true,
        message: 'Company verification updated.',
        company: { _id: companyId, name: 'Acme Technologies', verified: true },
      });

      const res = await request(app)
        .patch(`/api/v1/admin/companies/${companyId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company.verified).toBe(true);
    });

    it('Step 3.5: Query Security Audit Trail (GET /api/v1/admin/audit-logs)', async () => {
      jest.spyOn(AdminService, 'getAuditLogs').mockResolvedValue({
        data: [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            action: 'COMPANY_VERIFIED',
            resource: 'Company',
            resourceId: companyId,
            userId: { name: 'System Admin', email: 'admin@internhub.com', role: 'ADMIN' },
            createdAt: new Date(),
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.data[0].action).toBe('COMPANY_VERIFIED');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. EDGE CASES, CONFLICT & ERROR STATES
  // ═══════════════════════════════════════════════════════════════════════════
  describe('4. Edge Cases, Conflict & Error States', () => {
    it('rejects duplicate application to same internship (409 Conflict)', async () => {
      const { ApiError } = await import('../../src/utils/ApiError.js');
      jest.spyOn(ApplicationService, 'applyToInternship').mockRejectedValue(
        new ApiError(409, 'You have already submitted an application to this internship.')
      );

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          internshipId,
          coverLetter: 'Duplicate application attempt.',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already submitted an application/i);
    });

    it('rejects application to closed or expired internship (400 Bad Request)', async () => {
      const { ApiError } = await import('../../src/utils/ApiError.js');
      jest.spyOn(ApplicationService, 'applyToInternship').mockRejectedValue(
        new ApiError(400, 'The application deadline for this internship opportunity has passed.')
      );

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          internshipId,
          coverLetter: 'Attempting to apply to closed position.',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects scheduling interview with past date (400 Bad Request)', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();

      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          applicationId,
          scheduledAt: pastDate,
          duration: 30,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
