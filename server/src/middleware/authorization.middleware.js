import { ApiError } from '../utils/ApiError.js';
import { USER_ROLES } from '../models/User.model.js';
import { Internship } from '../models/Internship.model.js';
import { Application } from '../models/Application.model.js';
import { Company } from '../models/Company.model.js';
import { Document } from '../models/Document.model.js';

/**
 * Enforces role-based access control (RBAC).
 *
 * @param {...string} allowedRoles - E.g. 'STUDENT', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

/**
 * Restricts route to verified email users only.
 */
export const requireVerifiedEmail = (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  if (!req.user.isVerified) {
    return next(
      new ApiError(
        403,
        'Email verification required. Please verify your email address to perform this action.'
      )
    );
  }

  next();
};

/**
 * Restricts access to Platform Administrators (ADMIN or SUPER_ADMIN).
 */
export const requireAdmin = authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN);

/**
 * Restricts access to System Super Administrators only.
 */
export const requireSuperAdmin = authorizeRoles(USER_ROLES.SUPER_ADMIN);

/**
 * Restricts access to Student accounts only.
 */
export const requireStudent = authorizeRoles(USER_ROLES.STUDENT);

/**
 * Restricts access to Recruiter accounts only.
 */
export const requireRecruiter = authorizeRoles(USER_ROLES.RECRUITER);

/**
 * Generic Resource Ownership Verifier.
 *
 * Prevents Insecure Direct Object References (IDOR).
 *
 * @param {import('mongoose').Model} Model - Mongoose model to query
 * @param {object} options
 * @param {string} [options.paramName='id'] - Name of route param containing resource ObjectId
 * @param {string} [options.ownerField='userId'] - Document property storing owner ObjectId
 * @param {boolean} [options.allowAdmin=true] - Whether ADMIN/SUPER_ADMIN can bypass ownership
 * @param {string} [options.attachAs='resource'] - Name of property on `req` to store loaded document
 */
export const verifyOwnership = (
  Model,
  {
    paramName = 'id',
    ownerField = 'userId',
    allowAdmin = true,
    attachAs = 'resource',
  } = {}
) => {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'Authentication required.'));
      }

      const resourceId = req.params[paramName];
      if (!resourceId) {
        return next(new ApiError(400, `Missing resource parameter '${paramName}'.`));
      }

      const document = await Model.findById(resourceId);
      if (!document) {
        return next(
          new ApiError(404, `${Model.modelName || 'Resource'} with ID '${resourceId}' not found.`)
        );
      }

      // Check if Admin bypass is permitted
      const isAdmin =
        req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN;

      if (allowAdmin && isAdmin) {
        req[attachAs] = document;
        return next();
      }

      // Verify owner match
      const ownerId = document[ownerField]?.toString();
      const currentUserId = req.user._id.toString();

      if (ownerId !== currentUserId) {
        return next(
          new ApiError(
            403,
            'Access denied: You do not have permission to view or modify this resource.'
          )
        );
      }

      // Attach loaded document to request context
      req[attachAs] = document;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Specialized ownership verifier for Internship postings.
 * Ensures only the posting Recruiter or an Admin can edit/delete an internship.
 */
export const verifyInternshipOwnership = async (req, _res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    const internshipId = req.params.id;
    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return next(new ApiError(404, 'Internship not found.'));
    }

    const isAdmin =
      req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN;

    if (isAdmin) {
      req.internship = internship;
      return next();
    }

    // Verify creator or company ownership
    const isCreator = internship.createdBy.toString() === req.user._id.toString();

    if (!isCreator) {
      // Also verify if user is the company owner
      const company = await Company.findById(internship.companyId);
      if (!company || company.ownerId.toString() !== req.user._id.toString()) {
        return next(
          new ApiError(
            403,
            'Access denied: You can only manage internships created by your organization.'
          )
        );
      }
    }

    req.internship = internship;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Specialized ownership verifier for Job Applications.
 * - Students can only access their own submitted applications (read & withdraw).
 * - Recruiters can only access applications submitted to internships belonging to their company.
 * - Admins can moderate all applications.
 */
export const verifyApplicationOwnership = async (req, _res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    const applicationId = req.params.id;
    const application = await Application.findById(applicationId);

    if (!application) {
      return next(new ApiError(404, 'Application not found.'));
    }

    const currentUserId = req.user._id.toString();
    const isAdmin =
      req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN;

    if (isAdmin) {
      req.application = application;
      return next();
    }

    // Student access check: application must belong to student
    if (req.user.role === USER_ROLES.STUDENT) {
      if (application.studentId.toString() !== currentUserId) {
        return next(
          new ApiError(403, 'Access denied: You can only view and manage your own applications.')
        );
      }
      req.application = application;
      return next();
    }

    // Recruiter access check: application must belong to recruiter's company
    if (req.user.role === USER_ROLES.RECRUITER) {
      const company = await Company.findById(application.companyId);
      if (!company || company.ownerId.toString() !== currentUserId) {
        return next(
          new ApiError(
            403,
            'Access denied: You can only view applications for your company listings.'
          )
        );
      }
      req.application = application;
      return next();
    }

    return next(new ApiError(403, 'Access denied to this application.'));
  } catch (err) {
    next(err);
  }
};

/**
 * Specialized ownership verifier for Student Uploaded Documents (Resumes, Transcripts).
 */
export const verifyDocumentOwnership = verifyOwnership(Document, {
  paramName: 'id',
  ownerField: 'userId',
  allowAdmin: true,
  attachAs: 'document',
});

/**
 * Specialized ownership verifier for Company Profiles.
 */
export const verifyCompanyOwnership = verifyOwnership(Company, {
  paramName: 'id',
  ownerField: 'ownerId',
  allowAdmin: true,
  attachAs: 'company',
});

export default {
  authorizeRoles,
  requireVerifiedEmail,
  requireAdmin,
  requireSuperAdmin,
  requireStudent,
  requireRecruiter,
  verifyOwnership,
  verifyInternshipOwnership,
  verifyApplicationOwnership,
  verifyDocumentOwnership,
  verifyCompanyOwnership,
};
