import { describe, it, expect } from '@jest/globals';
import {
  createRecruiterInternshipSchema,
  updateRecruiterInternshipSchema,
  companyProfileSchema,
} from '../../src/validators/recruiter.validator.js';

describe('Recruiter Validator Schemas Unit Tests', () => {
  describe('createRecruiterInternshipSchema', () => {
    it('validates a valid internship creation payload', () => {
      const payload = {
        title: 'Backend Engineering Intern',
        description: 'Design and deploy high-performance microservices and cloud APIs.',
        skills: ['Node.js', 'PostgreSQL', 'Docker'],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        remote: 'REMOTE',
        type: 'FULL_TIME',
        openings: 2,
        stipend: { amount: 3000, currency: 'USD', period: 'MONTH', isUnpaid: false },
      };

      const { error } = createRecruiterInternshipSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('rejects openings count less than 1', () => {
      const payload = {
        title: 'Intern',
        description: 'A valid description with more than 20 characters.',
        skills: ['React'],
        applicationDeadline: new Date().toISOString(),
        openings: 0,
      };

      const { error } = createRecruiterInternshipSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/must be at least 1/i);
    });

    it('rejects short descriptions under 20 characters', () => {
      const payload = {
        title: 'Intern',
        description: 'Too short',
        skills: ['React'],
        applicationDeadline: new Date().toISOString(),
      };

      const { error } = createRecruiterInternshipSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/at least 20 characters/i);
    });
  });

  describe('companyProfileSchema', () => {
    it('validates a valid company profile payload', () => {
      const payload = {
        name: 'Stripe, Inc.',
        description: 'Financial infrastructure for the internet economy.',
        industry: 'Financial Services',
        companySize: '501-1000',
        website: 'https://stripe.com',
      };

      const { error } = companyProfileSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('rejects empty company name', () => {
      const payload = {
        name: '',
        description: 'A long description of the company.',
        industry: 'Software',
      };

      const { error } = companyProfileSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });
});
