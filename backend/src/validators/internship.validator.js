import Joi from 'joi';

/**
 * Validation schema for internship discovery query parameters.
 */
export const getInternshipsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  search: Joi.string().trim().max(100).allow('').optional(),
  location: Joi.string().trim().max(100).allow('').optional(),
  remote: Joi.string().valid('REMOTE', 'HYBRID', 'ONSITE', 'ALL', '').optional(),
  type: Joi.string().valid('FULL_TIME', 'PART_TIME', 'ALL', '').optional(),
  duration: Joi.string().trim().max(50).allow('').optional(),
  minStipend: Joi.number().min(0).optional(),
  maxStipend: Joi.number().min(0).optional(),
  skills: Joi.string().trim().allow('').optional(), // Comma-separated
  company: Joi.string().trim().allow('').optional(),
  category: Joi.string().trim().allow('').optional(),
  datePosted: Joi.string().valid('all', 'today', 'past_week', 'past_month', '').optional(),
  sortBy: Joi.string()
    .valid('latest', 'deadline', 'stipend_high', 'stipend_low', 'popularity')
    .default('latest'),
});

/**
 * Validation schema for creating a new internship posting.
 */
export const createInternshipSchema = Joi.object({
  companyId: Joi.string().trim().required().messages({
    'string.empty': 'Company ID is required',
  }),
  title: Joi.string().trim().min(3).max(200).required().messages({
    'string.empty': 'Title is required',
  }),
  description: Joi.string().trim().min(20).max(10000).required().messages({
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
  openings: Joi.number().integer().min(1).default(1),
  applicationDeadline: Joi.date().iso().required().messages({
    'date.base': 'Application deadline is required',
  }),
  category: Joi.string().trim().allow('').optional(),
});
