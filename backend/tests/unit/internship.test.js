import { describe, it, expect } from '@jest/globals';
import {
  getInternshipsQuerySchema,
  createInternshipSchema,
} from '../../src/validators/internship.validator.js';

describe('Internship Validation Schemas Unit Tests', () => {
  describe('getInternshipsQuerySchema', () => {
    it('applies sensible defaults for page and limit', () => {
      const { value, error } = getInternshipsQuerySchema.validate({});
      expect(error).toBeUndefined();
      expect(value.page).toBe(1);
      expect(value.limit).toBe(12);
      expect(value.sortBy).toBe('latest');
    });

    it('rejects limit exceeding maximum allowable page size (50)', () => {
      const { error } = getInternshipsQuerySchema.validate({ limit: 100 });
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/must be less than or equal to 50/i);
    });

    it('validates supported remote and sorting options', () => {
      const { value, error } = getInternshipsQuerySchema.validate({
        remote: 'REMOTE',
        sortBy: 'deadline',
        minStipend: 1500,
        skills: 'React,Node.js',
      });
      expect(error).toBeUndefined();
      expect(value.remote).toBe('REMOTE');
      expect(value.sortBy).toBe('deadline');
      expect(value.minStipend).toBe(1500);
    });

    it('rejects unsupported sorting values', () => {
      const { error } = getInternshipsQuerySchema.validate({
        sortBy: 'INVALID_SORT_KEY',
      });
      expect(error).toBeDefined();
    });
  });

  describe('createInternshipSchema', () => {
    it('validates a complete internship posting', () => {
      const payload = {
        companyId: '60d5ec49f1b2c8b1f8e4e1a1',
        title: 'Backend Engineer Intern',
        description: 'Join our infrastructure team building scalable microservices in Go and Node.js.',
        skills: ['Go', 'Docker', 'PostgreSQL'],
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        remote: 'REMOTE',
      };

      const { error } = createInternshipSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('fails when skills list is missing or empty', () => {
      const payload = {
        companyId: '60d5ec49f1b2c8b1f8e4e1a1',
        title: 'Intern',
        description: 'A description of the role.',
        skills: [],
        applicationDeadline: new Date().toISOString(),
      };

      const { error } = createInternshipSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });
});
