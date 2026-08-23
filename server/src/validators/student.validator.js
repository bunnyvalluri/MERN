import Joi from 'joi';

const educationItemSchema = Joi.object({
  _id: Joi.string().optional(),
  institution: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Institution name is required',
  }),
  degree: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Degree is required',
  }),
  fieldOfStudy: Joi.string().trim().max(100).allow('').optional(),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
  }),
  endDate: Joi.date().iso().allow(null).optional(),
  current: Joi.boolean().default(false),
  gpa: Joi.string().trim().max(10).allow('').optional(),
});

const experienceItemSchema = Joi.object({
  _id: Joi.string().optional(),
  title: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Job title is required',
  }),
  company: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Company name is required',
  }),
  location: Joi.string().trim().allow('').optional(),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
  }),
  endDate: Joi.date().iso().allow(null).optional(),
  current: Joi.boolean().default(false),
  description: Joi.string().trim().max(2000).allow('').optional(),
});

const projectItemSchema = Joi.object({
  _id: Joi.string().optional(),
  title: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Project title is required',
  }),
  description: Joi.string().trim().max(2000).required().messages({
    'string.empty': 'Project description is required',
  }),
  link: Joi.string().uri().allow('').optional(),
  githubUrl: Joi.string().uri().allow('').optional(),
  technologies: Joi.array().items(Joi.string().trim().max(50)).default([]),
});

const certificationItemSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Certification name is required',
  }),
  issuer: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Issuer name is required',
  }),
  issueDate: Joi.date().iso().allow(null).optional(),
  expiryDate: Joi.date().iso().allow(null).optional(),
  credentialId: Joi.string().trim().allow('').optional(),
  credentialUrl: Joi.string().uri().allow('').optional(),
});

/**
 * Validation schema for student profile update requests.
 */
export const updateStudentProfileSchema = Joi.object({
  headline: Joi.string().trim().max(200).allow('').optional(),
  bio: Joi.string().trim().max(3000).allow('').optional(),
  phone: Joi.string().trim().max(25).allow('').optional(),
  location: Joi.object({
    city: Joi.string().trim().allow('').optional(),
    state: Joi.string().trim().allow('').optional(),
    country: Joi.string().trim().allow('').optional(),
  }).optional(),
  education: Joi.array().items(educationItemSchema).max(20).optional(),
  skills: Joi.array().items(Joi.string().trim().max(50)).max(50).optional(),
  experience: Joi.array().items(experienceItemSchema).max(30).optional(),
  projects: Joi.array().items(projectItemSchema).max(30).optional(),
  certifications: Joi.array().items(certificationItemSchema).max(30).optional(),
  portfolio: Joi.string().uri().allow('').optional(),
  github: Joi.string().uri().allow('').optional(),
  linkedin: Joi.string().uri().allow('').optional(),
  preferences: Joi.object({
    desiredRoles: Joi.array().items(Joi.string().trim()).optional(),
    targetLocations: Joi.array().items(Joi.string().trim()).optional(),
    remotePreference: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE').optional(),
    expectedStipend: Joi.object({
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().trim().max(10).optional(),
      period: Joi.string().valid('HOUR', 'MONTH', 'TOTAL').optional(),
    }).optional(),
  }).optional(),
});

/**
 * Validation schema for resume upload / update.
 */
export const resumeUploadSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.empty': 'Resume URL is required',
  }),
  fileName: Joi.string().trim().max(200).required().messages({
    'string.empty': 'File name is required',
  }),
  publicId: Joi.string().trim().allow(null, '').optional(),
});
