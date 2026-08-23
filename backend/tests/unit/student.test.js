import { describe, it, expect } from '@jest/globals';
import { calculateProfileCompletion } from '../../src/services/student.service.js';
import { updateStudentProfileSchema } from '../../src/validators/student.validator.js';

describe('Student Profile & Completion Calculation Unit Tests', () => {
  describe('Dynamic Profile Completion Calculation', () => {
    it('returns 0% for an empty student profile', () => {
      const completion = calculateProfileCompletion({});
      expect(completion.percentage).toBe(0);
      expect(completion.breakdown.basicInfo.completed).toBe(false);
      expect(completion.breakdown.education.completed).toBe(false);
      expect(completion.breakdown.skills.completed).toBe(false);
      expect(completion.breakdown.experience.completed).toBe(false);
      expect(completion.breakdown.projects.completed).toBe(false);
      expect(completion.breakdown.resume.completed).toBe(false);
      expect(completion.nextSteps.length).toBeGreaterThan(0);
    });

    it('awards 20% for complete basic information', () => {
      const profile = {
        headline: 'Frontend Engineer',
        bio: 'Passionate computer science student building full-stack web applications.',
        phone: '+1 (555) 123-4567',
        location: { city: 'San Francisco', country: 'United States' },
      };

      const completion = calculateProfileCompletion(profile);
      expect(completion.breakdown.basicInfo.completed).toBe(true);
      expect(completion.breakdown.basicInfo.earned).toBe(20);
      expect(completion.percentage).toBe(20);
    });

    it('awards 20% for education when at least 1 degree is present', () => {
      const profile = {
        education: [
          {
            institution: 'Stanford University',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2022-09-01'),
          },
        ],
      };

      const completion = calculateProfileCompletion(profile);
      expect(completion.breakdown.education.completed).toBe(true);
      expect(completion.breakdown.education.earned).toBe(20);
      expect(completion.percentage).toBe(20);
    });

    it('awards 20% for skills when 3 or more skills are present', () => {
      const profile = {
        skills: ['React', 'TypeScript', 'Node.js'],
      };

      const completion = calculateProfileCompletion(profile);
      expect(completion.breakdown.skills.completed).toBe(true);
      expect(completion.breakdown.skills.earned).toBe(20);
      expect(completion.percentage).toBe(20);
    });

    it('calculates exact 100% for a comprehensive profile across all 6 categories', () => {
      const fullProfile = {
        headline: 'Software Engineer Intern',
        bio: 'Motivated student engineer passionate about cloud architecture and distributed systems.',
        phone: '+1 (555) 987-6543',
        location: { city: 'Seattle', country: 'United States' },
        education: [
          {
            institution: 'University of Washington',
            degree: 'BS Computer Science',
            startDate: new Date('2021-09-01'),
          },
        ],
        skills: ['React', 'Go', 'Docker', 'Kubernetes'],
        experience: [
          {
            title: 'SWE Intern',
            company: 'TechCorp',
            startDate: new Date('2023-06-01'),
          },
        ],
        projects: [
          {
            title: 'Distributed Key-Value Store',
            description: 'Raft consensus based distributed storage in Go.',
          },
        ],
        resume: {
          url: 'https://cloudinary.com/resume.pdf',
          fileName: 'Resume.pdf',
        },
      };

      const completion = calculateProfileCompletion(fullProfile);
      expect(completion.percentage).toBe(100);
      expect(completion.breakdown.basicInfo.completed).toBe(true);
      expect(completion.breakdown.education.completed).toBe(true);
      expect(completion.breakdown.skills.completed).toBe(true);
      expect(completion.breakdown.experience.completed).toBe(true);
      expect(completion.breakdown.projects.completed).toBe(true);
      expect(completion.breakdown.resume.completed).toBe(true);
      expect(completion.nextSteps).toHaveLength(0);
    });
  });

  describe('Student Profile Validation Schema', () => {
    it('validates a valid student profile update payload', () => {
      const payload = {
        headline: 'Frontend Engineer',
        bio: 'Building accessible web apps with React and Tailwind CSS.',
        skills: ['React', 'JavaScript'],
        portfolio: 'https://alexrivera.dev',
      };

      const { error } = updateStudentProfileSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('rejects invalid portfolio URL format', () => {
      const payload = {
        portfolio: 'invalid-non-url-string',
      };

      const { error } = updateStudentProfileSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/must be a valid uri/i);
    });
  });
});
