import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import {
  authorizeRoles,
  requireVerifiedEmail,
  requireAdmin,
  requireSuperAdmin,
  requireStudent,
  requireRecruiter,
  verifyOwnership,
  verifyInternshipOwnership,
  verifyApplicationOwnership,
} from '../../src/middleware/authorization.middleware.js';
import { Internship } from '../../src/models/Internship.model.js';
import { Application } from '../../src/models/Application.model.js';
import { Company } from '../../src/models/Company.model.js';
import { USER_ROLES } from '../../src/models/User.model.js';

describe('RBAC & Resource Ownership Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let nextFn;

  beforeEach(() => {
    mockReq = {
      user: null,
      params: {},
      body: {},
    };
    mockRes = {};
    nextFn = jest.fn();
  });

  describe('authorizeRoles Middleware', () => {
    it('returns 401 if req.user is undefined', () => {
      const middleware = authorizeRoles(USER_ROLES.RECRUITER);
      middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'Authentication required.' })
      );
    });

    it('rejects STUDENT from accessing RECRUITER route with 403 Forbidden', () => {
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.STUDENT };
      const middleware = authorizeRoles(USER_ROLES.RECRUITER);
      middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringMatching(/Role 'STUDENT' is not authorized/),
        })
      );
    });

    it('allows RECRUITER to access RECRUITER route', () => {
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.RECRUITER };
      const middleware = authorizeRoles(USER_ROLES.RECRUITER);
      middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
    });

    it('requireAdmin allows ADMIN and SUPER_ADMIN, but rejects STUDENT and RECRUITER', () => {
      // Test STUDENT rejected
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.STUDENT };
      requireAdmin(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));

      // Test RECRUITER rejected
      nextFn.mockClear();
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.RECRUITER };
      requireAdmin(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));

      // Test ADMIN allowed
      nextFn.mockClear();
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.ADMIN };
      requireAdmin(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledWith();

      // Test SUPER_ADMIN allowed
      nextFn.mockClear();
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.SUPER_ADMIN };
      requireAdmin(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledWith();
    });

    it('requireSuperAdmin allows ONLY SUPER_ADMIN and rejects standard ADMIN', () => {
      // Test ADMIN rejected
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.ADMIN };
      requireSuperAdmin(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));

      // Test SUPER_ADMIN allowed
      nextFn.mockClear();
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.SUPER_ADMIN };
      requireSuperAdmin(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledWith();
    });
  });

  describe('requireVerifiedEmail Middleware', () => {
    it('rejects unverified user with 403 Forbidden', () => {
      mockReq.user = { _id: new mongoose.Types.ObjectId(), isVerified: false };
      requireVerifiedEmail(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringMatching(/Email verification required/),
        })
      );
    });

    it('allows verified user to proceed', () => {
      mockReq.user = { _id: new mongoose.Types.ObjectId(), isVerified: true };
      requireVerifiedEmail(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
    });
  });

  describe('verifyOwnership Middleware (Generic IDOR Protection)', () => {
    const mockModel = {
      modelName: 'TestResource',
      findById: jest.fn(),
    };

    it('rejects with 404 when document does not exist', async () => {
      mockReq.user = { _id: new mongoose.Types.ObjectId(), role: USER_ROLES.STUDENT };
      mockReq.params.id = new mongoose.Types.ObjectId().toString();
      mockModel.findById.mockResolvedValue(null);

      const middleware = verifyOwnership(mockModel);
      await middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: expect.stringMatching(/not found/) })
      );
    });

    it('rejects with 403 Forbidden when user is not the owner (IDOR attempt)', async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const attackerId = new mongoose.Types.ObjectId();

      mockReq.user = { _id: attackerId, role: USER_ROLES.STUDENT };
      mockReq.params.id = 'resource123';
      mockModel.findById.mockResolvedValue({ _id: 'resource123', userId: ownerId });

      const middleware = verifyOwnership(mockModel);
      await middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403, message: expect.stringMatching(/Access denied/) })
      );
    });

    it('allows owner to access their own resource and attaches document to req', async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const doc = { _id: 'resource123', userId: ownerId, title: 'My Resume' };

      mockReq.user = { _id: ownerId, role: USER_ROLES.STUDENT };
      mockReq.params.id = 'resource123';
      mockModel.findById.mockResolvedValue(doc);

      const middleware = verifyOwnership(mockModel, { attachAs: 'document' });
      await middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
      expect(mockReq.document).toEqual(doc);
    });

    it('allows ADMIN to bypass ownership when allowAdmin is true', async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const adminId = new mongoose.Types.ObjectId();
      const doc = { _id: 'resource123', userId: ownerId };

      mockReq.user = { _id: adminId, role: USER_ROLES.ADMIN };
      mockReq.params.id = 'resource123';
      mockModel.findById.mockResolvedValue(doc);

      const middleware = verifyOwnership(mockModel, { allowAdmin: true });
      await middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
      expect(mockReq.resource).toEqual(doc);
    });
  });

  describe('verifyInternshipOwnership Middleware', () => {
    it('rejects Recruiter B from editing Recruiter A internship (IDOR attempt)', async () => {
      const recruiterA = new mongoose.Types.ObjectId();
      const recruiterB = new mongoose.Types.ObjectId();
      const companyId = new mongoose.Types.ObjectId();

      mockReq.user = { _id: recruiterB, role: USER_ROLES.RECRUITER };
      mockReq.params.id = 'internship123';

      jest.spyOn(Internship, 'findById').mockResolvedValue({
        _id: 'internship123',
        createdBy: recruiterA,
        companyId,
      });

      jest.spyOn(Company, 'findById').mockResolvedValue({
        _id: companyId,
        ownerId: recruiterA,
      });

      await verifyInternshipOwnership(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringMatching(/only manage internships created by your organization/),
        })
      );
    });

    it('allows creating recruiter to edit their own internship', async () => {
      const recruiterA = new mongoose.Types.ObjectId();
      const mockInternship = {
        _id: 'internship123',
        createdBy: recruiterA,
        companyId: new mongoose.Types.ObjectId(),
      };

      mockReq.user = { _id: recruiterA, role: USER_ROLES.RECRUITER };
      mockReq.params.id = 'internship123';

      jest.spyOn(Internship, 'findById').mockResolvedValue(mockInternship);

      await verifyInternshipOwnership(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
      expect(mockReq.internship).toEqual(mockInternship);
    });

    it('allows ADMIN to moderate any recruiter internship', async () => {
      const recruiterA = new mongoose.Types.ObjectId();
      const adminUser = new mongoose.Types.ObjectId();
      const mockInternship = {
        _id: 'internship123',
        createdBy: recruiterA,
      };

      mockReq.user = { _id: adminUser, role: USER_ROLES.ADMIN };
      mockReq.params.id = 'internship123';

      jest.spyOn(Internship, 'findById').mockResolvedValue(mockInternship);

      await verifyInternshipOwnership(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
      expect(mockReq.internship).toEqual(mockInternship);
    });
  });

  describe('verifyApplicationOwnership Middleware', () => {
    it('rejects Student B from viewing Student A application (IDOR attempt)', async () => {
      const studentA = new mongoose.Types.ObjectId();
      const studentB = new mongoose.Types.ObjectId();

      mockReq.user = { _id: studentB, role: USER_ROLES.STUDENT };
      mockReq.params.id = 'app123';

      jest.spyOn(Application, 'findById').mockResolvedValue({
        _id: 'app123',
        studentId: studentA,
        companyId: new mongoose.Types.ObjectId(),
      });

      await verifyApplicationOwnership(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringMatching(/only view and manage your own applications/),
        })
      );
    });

    it('allows student to view their own application', async () => {
      const studentA = new mongoose.Types.ObjectId();
      const mockApp = {
        _id: 'app123',
        studentId: studentA,
        companyId: new mongoose.Types.ObjectId(),
      };

      mockReq.user = { _id: studentA, role: USER_ROLES.STUDENT };
      mockReq.params.id = 'app123';

      jest.spyOn(Application, 'findById').mockResolvedValue(mockApp);

      await verifyApplicationOwnership(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
      expect(mockReq.application).toEqual(mockApp);
    });

    it('rejects Recruiter B from viewing application submitted to Recruiter A company', async () => {
      const recruiterA = new mongoose.Types.ObjectId();
      const recruiterB = new mongoose.Types.ObjectId();
      const companyAId = new mongoose.Types.ObjectId();

      mockReq.user = { _id: recruiterB, role: USER_ROLES.RECRUITER };
      mockReq.params.id = 'app123';

      jest.spyOn(Application, 'findById').mockResolvedValue({
        _id: 'app123',
        studentId: new mongoose.Types.ObjectId(),
        companyId: companyAId,
      });

      jest.spyOn(Company, 'findById').mockResolvedValue({
        _id: companyAId,
        ownerId: recruiterA,
      });

      await verifyApplicationOwnership(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringMatching(/only view applications for your company listings/),
        })
      );
    });

    it('allows Recruiter A to view application submitted to their company', async () => {
      const recruiterA = new mongoose.Types.ObjectId();
      const companyAId = new mongoose.Types.ObjectId();
      const mockApp = {
        _id: 'app123',
        studentId: new mongoose.Types.ObjectId(),
        companyId: companyAId,
      };

      mockReq.user = { _id: recruiterA, role: USER_ROLES.RECRUITER };
      mockReq.params.id = 'app123';

      jest.spyOn(Application, 'findById').mockResolvedValue(mockApp);
      jest.spyOn(Company, 'findById').mockResolvedValue({
        _id: companyAId,
        ownerId: recruiterA,
      });

      await verifyApplicationOwnership(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith();
      expect(mockReq.application).toEqual(mockApp);
    });
  });
});
