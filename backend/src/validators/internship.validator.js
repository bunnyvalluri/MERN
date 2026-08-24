import Joi from 'joi';

/**
 * Validation schema for internship discovery query parameters.
 */
export const getInternshipsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  search: Joi.string().trim().max(200).allow('').optional(),
  location: Joi.string().trim().max(100).allow('').optional(),
  remote: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE', 'ALL', '').optional(),
  workMode: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE', 'ALL', '').optional(),
  type: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'ALL', '').optional(),
  employmentType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'ALL', '').optional(),
  opportunityType: Joi.string().valid('INTERNSHIP', 'JOB', 'FELLOWSHIP', 'ALL', '').optional(),
  duration: Joi.string().trim().max(50).allow('').optional(),
  minStipend: Joi.number().min(0).allow('').optional(),
  maxStipend: Joi.number().min(0).allow('').optional(),
  stipendMin: Joi.number().min(0).allow('').optional(),
  stipendMax: Joi.number().min(0).allow('').optional(),
  skills: Joi.string().trim().allow('').optional(), // Comma-separated
  company: Joi.string().trim().allow('').optional(),
  category: Joi.string().trim().allow('').optional(),
  experience: Joi.string().trim().allow('').optional(),
  experienceMin: Joi.number().min(0).optional(),
  experienceMax: Joi.number().min(0).optional(),
  datePosted: Joi.string().valid('all', 'today', 'past_week', 'past_month', '24h', '7d', '14d', '30d', '').optional(),
  postedWithin: Joi.string().valid('all', 'today', 'past_week', 'past_month', '24h', '7d', '14d', '30d', '').optional(),
  sortBy: Joi.string()
    .valid('latest', 'deadline', 'stipend_high', 'stipend_low', 'popularity', 'relevant', 'newest')
    .default('latest'),
  sort: Joi.string().optional(),
});

/**
 * Validation schema for creating a new internship posting.
 */
export const createInternshipSchema = Joi.object({
  companyId: Joi.string().trim().optional().allow('', null),
  companyName: Joi.string().trim().min(2).max(150).optional(),
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Title is required',
  }),
  description: Joi.string().trim().min(10).max(25000).required().messages({
    'string.empty': 'Description is required',
  }),
  responsibilities: Joi.array().items(Joi.string().trim()).default([]),
  requirements: Joi.array().items(Joi.string().trim()).default([]),
  skills: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    'array.min': 'At least one skill tag is required',
  }),
  location: Joi.object({
    city: Joi.string().trim().allow('').optional(),
    state: Joi.string().trim().allow('').optional(),
    country: Joi.string().trim().allow('').optional(),
    address: Joi.string().trim().allow('').optional(),
  }).optional(),
  workMode: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE').default('REMOTE'),
  remote: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE').default('REMOTE'),
  employmentType: Joi.string().valid('INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT').default('INTERNSHIP'),
  opportunityType: Joi.string().valid('INTERNSHIP', 'JOB', 'FELLOWSHIP').default('INTERNSHIP'),
  type: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP').default('FULL_TIME'),
  duration: Joi.string().trim().default('3 Months'),
  stipend: Joi.object({
    amount: Joi.number().min(0).allow(null).default(0),
    currency: Joi.string().trim().default('INR'),
    period: Joi.string().valid('HOUR', 'MONTH', 'TOTAL', 'YEAR').default('MONTH'),
    isUnpaid: Joi.boolean().default(false),
  }).default({ amount: 0, currency: 'INR', period: 'MONTH', isUnpaid: false }),
  openings: Joi.number().integer().min(1).default(1),
  applicationDeadline: Joi.date().iso().required().messages({
    'date.base': 'Application deadline is required',
  }),
  category: Joi.string().trim().allow('').optional(),
  applicationUrl: Joi.string().trim().allow('').optional(),
  applicationMethod: Joi.string().valid('INTERNAL', 'EXTERNAL').default('INTERNAL'),
});
