import Joi from 'joi';
import { INTERVIEW_STATUS, INTERVIEW_TYPE } from '../models/Interview.model.js';

/**
 * Validation schema for recruiter scheduling an interview.
 */
export const scheduleInterviewSchema = Joi.object({
  applicationId: Joi.string().trim().required().messages({
    'string.empty': 'Application ID is required',
    'any.required': 'Application ID is required',
  }),
  scheduledAt: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Interview date and time must be in the future',
    'date.base': 'A valid interview date and time is required',
    'any.required': 'Interview date is required',
  }),
  durationMinutes: Joi.number().integer().min(15).max(240).default(45),
  duration: Joi.number().integer().min(15).max(240).optional(),
  type: Joi.string()
    .valid(...Object.values(INTERVIEW_TYPE))
    .default(INTERVIEW_TYPE.VIDEO),
  meetingUrl: Joi.string().trim().allow('').optional(),
  meetingLink: Joi.string().trim().allow('').optional(),
  interviewer: Joi.object({
    name: Joi.string().trim().max(100).allow('').default(''),
    email: Joi.string().email().allow('').default(''),
  }).optional(),
  notes: Joi.string().trim().max(2000).allow('').default(''),
});

/**
 * Validation schema for rescheduling an interview.
 */
export const rescheduleInterviewSchema = Joi.object({
  scheduledAt: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'New interview date and time must be in the future',
    'date.base': 'A valid future date and time is required',
    'any.required': 'New interview date is required',
  }),
  durationMinutes: Joi.number().integer().min(15).max(240).optional(),
  duration: Joi.number().integer().min(15).max(240).optional(),
  type: Joi.string().valid(...Object.values(INTERVIEW_TYPE)).optional(),
  meetingUrl: Joi.string().trim().allow('').optional(),
  meetingLink: Joi.string().trim().allow('').optional(),
  notes: Joi.string().trim().max(2000).allow('').optional(),
  reason: Joi.string().trim().max(500).allow('').default('Interview rescheduled'),
});

/**
 * Validation schema for cancelling an interview.
 */
export const cancelInterviewSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('').default('Cancelled by hiring team'),
});

/**
 * Validation schema for updating meeting link and notes.
 */
export const updateInterviewDetailsSchema = Joi.object({
  meetingUrl: Joi.string().trim().allow('').optional(),
  meetingLink: Joi.string().trim().allow('').optional(),
  notes: Joi.string().trim().max(2000).allow('').optional(),
  interviewer: Joi.object({
    name: Joi.string().trim().max(100).allow('').optional(),
    email: Joi.string().email().allow('').optional(),
  }).optional(),
});

/**
 * Validation schema for completing an interview with feedback.
 */
export const completeInterviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  notes: Joi.string().trim().max(3000).allow('').optional(),
});

/**
 * Validation schema for querying interviews.
 */
export const getInterviewsQuerySchema = Joi.object({
  status: Joi.string()
    .valid('ALL', ...Object.values(INTERVIEW_STATUS))
    .default('ALL'),
  timeframe: Joi.string().valid('all', 'upcoming', 'past').default('all'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});
