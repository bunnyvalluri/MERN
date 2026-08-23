import { describe, it, expect } from '@jest/globals';
import mongoose from 'mongoose';
import {
  User,
  USER_ROLES,
  StudentProfile,
  Company,
  Internship,
  INTERNSHIP_STATUS,
  Application,
  APPLICATION_STATUS,
  Notification,
  SavedInternship,
  Interview,
  Document,
  AuditLog,
} from '../../src/models/index.js';

describe('Mongoose Models Schema & Validation', () => {
  describe('User Model', () => {
    it('validates a correct user object', () => {
      const user = new User({
        name: 'Sarah Jenkins',
        email: 'sarah.j@stanford.edu',
        passwordHash: 'hashed_password_sample_123',
        role: USER_ROLES.STUDENT,
      });

      const err = user.validateSync();
      expect(err).toBeUndefined();
      expect(user.role).toBe('STUDENT');
      expect(user.isActive).toBe(true);
      expect(user.isVerified).toBe(false);
    });

    it('fails validation when email is invalid', () => {
      const user = new User({
        name: 'Alex Rivera',
        email: 'invalid-email-format',
        passwordHash: 'secret123',
      });

      const err = user.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('rejects unsupported role enums', () => {
      const user = new User({
        name: 'Hacker',
        email: 'hacker@example.com',
        passwordHash: 'secret123',
        role: 'NON_EXISTENT_ROLE',
      });

      const err = user.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.role).toBeDefined();
    });
  });

  describe('Internship Model', () => {
    it('validates an internship posting correctly', () => {
      const internship = new Internship({
        companyId: new mongoose.Types.ObjectId(),
        title: 'Frontend Engineer Intern',
        slug: 'vercel-frontend-engineer-intern',
        description: 'Work with the design systems team at Vercel.',
        skills: ['React', 'TypeScript', 'Tailwind'],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: INTERNSHIP_STATUS.PUBLISHED,
        createdBy: new mongoose.Types.ObjectId(),
      });

      const err = internship.validateSync();
      expect(err).toBeUndefined();
      expect(internship.openings).toBe(1);
      expect(internship.remote).toBe('REMOTE');
    });

    it('fails when skills array is empty or missing', () => {
      const internship = new Internship({
        companyId: new mongoose.Types.ObjectId(),
        title: 'Backend Intern',
        slug: 'backend-intern',
        description: 'Work with databases.',
        applicationDeadline: new Date(),
        createdBy: new mongoose.Types.ObjectId(),
      });

      const err = internship.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.skills).toBeDefined();
    });
  });

  describe('Application Model', () => {
    it('validates a student application with default APPLIED status', () => {
      const application = new Application({
        studentId: new mongoose.Types.ObjectId(),
        internshipId: new mongoose.Types.ObjectId(),
        companyId: new mongoose.Types.ObjectId(),
        resume: { url: 'https://cloudinary.com/sample_resume.pdf' },
        coverLetter: 'I am passionate about frontend systems.',
      });

      const err = application.validateSync();
      expect(err).toBeUndefined();
      expect(application.status).toBe(APPLICATION_STATUS.APPLIED);
      expect(application.timeline).toHaveLength(1);
      expect(application.timeline[0].status).toBe(APPLICATION_STATUS.APPLIED);
    });

    it('fails when resume url is missing', () => {
      const application = new Application({
        studentId: new mongoose.Types.ObjectId(),
        internshipId: new mongoose.Types.ObjectId(),
        companyId: new mongoose.Types.ObjectId(),
      });

      const err = application.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['resume.url']).toBeDefined();
    });
  });

  describe('Company Model', () => {
    it('validates a company profile with URL pattern check', () => {
      const company = new Company({
        name: 'Vercel, Inc.',
        slug: 'vercel',
        description: 'Develop, preview, ship frontend software.',
        website: 'https://vercel.com',
        industry: 'Cloud Infrastructure',
        ownerId: new mongoose.Types.ObjectId(),
      });

      const err = company.validateSync();
      expect(err).toBeUndefined();
      expect(company.verified).toBe(false);
    });
  });

  describe('SavedInternship Model', () => {
    it('validates studentId and internshipId references', () => {
      const saved = new SavedInternship({
        studentId: new mongoose.Types.ObjectId(),
        internshipId: new mongoose.Types.ObjectId(),
      });

      const err = saved.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('Notification Model', () => {
    it('validates notification with default unread state', () => {
      const notif = new Notification({
        userId: new mongoose.Types.ObjectId(),
        title: 'Interview Scheduled',
        message: 'Your interview with Stripe is confirmed.',
      });

      const err = notif.validateSync();
      expect(err).toBeUndefined();
      expect(notif.read).toBe(false);
    });
  });
});
