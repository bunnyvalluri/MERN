import Joi from 'joi';

/**
 * Validation schema for Recruiter creating an Internship.
 */
export const createRecruiterInternshipSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    'string.empty': 'Internship title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().trim().min(20).max(10000).required().messages({
    'string.empty': 'Job description is required',
    'string.min': 'Description must be at least 20 characters',
    'string.max': 'Description cannot exceed 10000 characters',
  }),
  responsibilities: Joi.array().items(Joi.string().trim()).default([]),
  requirements: Joi.array().items(Joi.string().trim()).default([]),
  skills: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    'array.min': 'At least one skill tag is required',
    'any.required': 'At least one skill tag is required',
  }),
  location: Joi.object({
    city: Joi.string().trim().allow('').optional(),
    state: Joi.string().trim().allow('').optional(),
    country: Joi.string().trim().allow('').optional(),
  }).optional(),
  remote: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE').default('REMOTE'),
  type: Joi.string().valid('FULL_TIME', 'PART_TIME').default('FULL_TIME'),
  duration: Joi.string().trim().default('3 Months'),
  stipend: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().trim().default('USD'),
    period: Joi.string().valid('HOUR', 'MONTH', 'TOTAL').default('MONTH'),
    isUnpaid: Joi.boolean().default(false),
  }).default({ amount: 0, currency: 'USD', period: 'MONTH', isUnpaid: false }),
  openings: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'Openings count must be at least 1',
    'number.base': 'Openings count must be a valid number',
  }),
  applicationDeadline: Joi.date().iso().required().messages({
    'date.base': 'Application deadline is required and must be a valid date',
    'any.required': 'Application deadline is required',
  }),
  category: Joi.string().trim().allow('').optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED').default('DRAFT'),
});

/**
 * Validation schema for Recruiter updating an Internship.
 */
export const updateRecruiterInternshipSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().min(20).max(10000).optional(),
  responsibilities: Joi.array().items(Joi.string().trim()).optional(),
  requirements: Joi.array().items(Joi.string().trim()).optional(),
  skills: Joi.array().items(Joi.string().trim()).min(1).optional(),
  location: Joi.object({
    city: Joi.string().trim().allow('').optional(),
    state: Joi.string().trim().allow('').optional(),
    country: Joi.string().trim().allow('').optional(),
  }).optional(),
  remote: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE').optional(),
  type: Joi.string().valid('FULL_TIME', 'PART_TIME').optional(),
  duration: Joi.string().trim().optional(),
  stipend: Joi.object({
    amount: Joi.number().min(0).optional(),
    currency: Joi.string().trim().optional(),
    period: Joi.string().valid('HOUR', 'MONTH', 'TOTAL').optional(),
    isUnpaid: Joi.boolean().optional(),
  }).optional(),
  openings: Joi.number().integer().min(1).optional(),
  applicationDeadline: Joi.date().iso().optional(),
  category: Joi.string().trim().allow('').optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED').optional(),
});

/**
 * Validation schema for Company Profile creation & update.
 */
export const companyProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Company name is required',
    'string.min': 'Company name must be at least 2 characters',
  }),
  logo: Joi.string().uri().allow('', null).optional(),
  description: Joi.string().trim().min(10).max(5000).required().messages({
    'string.empty': 'Company description is required',
  }),
  website: Joi.string().uri().allow('', null).optional(),
  industry: Joi.string().trim().required().messages({
    'string.empty': 'Industry is required',
  }),
  location: Joi.object({
    city: Joi.string().trim().allow('').optional(),
    state: Joi.string().trim().allow('').optional(),
    country: Joi.string().trim().allow('').optional(),
    address: Joi.string().trim().allow('').optional(),
  }).optional(),
  companySize: Joi.string()
    .valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')
    .default('11-50'),
  foundedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
});
