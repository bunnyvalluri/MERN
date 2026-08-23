import Joi from 'joi';
import { APPLICATION_STATUS } from '../models/Application.model.js';
import { INTERVIEW_TYPE } from '../models/Interview.model.js';

/**
 * Validation schema for student applying to an internship.
 */
export const applyInternshipSchema = Joi.object({
  internshipId: Joi.string().trim().required().messages({
    'string.empty': 'Internship ID is required',
    'any.required': 'Internship ID is required',
  }),
  coverLetter: Joi.string().trim().max(5000).allow('').default(''),
  resume: Joi.object({
    url: Joi.string().uri().required().messages({
      'string.empty': 'Resume URL is required',
      'any.required': 'Resume URL is required',
    }),
    publicId: Joi.string().allow(null, '').optional(),
    fileName: Joi.string().trim().max(255).default('resume.pdf'),
  }).optional(), // Optional if student profile has an existing resume
});

/**
 * Validation schema for student withdrawing an application.
 */
export const withdrawApplicationSchema = Joi.object({
  note: Joi.string().trim().max(500).allow('').default('Withdrawn by student'),
});

/**
 * Validation schema for updating application status by recruiter.
 */
export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      APPLICATION_STATUS.UNDER_REVIEW,
      APPLICATION_STATUS.SHORTLISTED,
      APPLICATION_STATUS.INTERVIEW,
      APPLICATION_STATUS.SELECTED,
      APPLICATION_STATUS.REJECTED
    )
    .required()
    .messages({
      'any.only': 'Invalid application status transition',
      'any.required': 'Status is required',
    }),
  note: Joi.string().trim().max(500).allow('').default(''),
});

/**
 * Validation schema for recruiter adding internal review note.
 */
export const addApplicationNoteSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Note content cannot be empty',
    'any.required': 'Note content is required',
  }),
});

/**
 * Validation schema for scheduling an interview.
 */
export const scheduleInterviewSchema = Joi.object({
  scheduledAt: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Interview date must be in the future',
    'date.base': 'A valid interview date and time is required',
    'any.required': 'Interview date is required',
  }),
  durationMinutes: Joi.number().integer().min(15).max(240).default(45),
  type: Joi.string()
    .valid(...Object.values(INTERVIEW_TYPE))
    .default(INTERVIEW_TYPE.VIDEO),
  meetingLink: Joi.string().uri().allow('').optional(),
  interviewer: Joi.object({
    name: Joi.string().trim().max(100).allow('').default(''),
    email: Joi.string().email().allow('').default(''),
  }).optional(),
  notes: Joi.string().trim().max(2000).allow('').default(''),
});

/**
 * Validation schema for querying student applications.
 */
export const getStudentApplicationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string()
    .valid('ALL', ...Object.values(APPLICATION_STATUS))
    .default('ALL'),
  sortBy: Joi.string().valid('latest', 'oldest', 'status').default('latest'),
});

/**
 * Validation schema for querying recruiter applications.
 */
export const getRecruiterApplicationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string()
    .valid('ALL', ...Object.values(APPLICATION_STATUS))
    .default('ALL'),
  internshipId: Joi.string().trim().allow('').optional(),
  search: Joi.string().trim().max(100).allow('').optional(),
  sortBy: Joi.string().valid('latest', 'oldest', 'status').default('latest'),
});
