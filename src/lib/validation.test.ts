import { describe, it, expect } from 'vitest';
import { registerSchema, jobSchema } from './validation';

describe('Zod Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate complete register input successfully', () => {
      const payload = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid emails', () => {
      const payload = { name: 'John Doe', email: 'not-an-email', password: 'password123' };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should reject short passwords', () => {
      const payload = { name: 'John Doe', email: 'john@example.com', password: '123' };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('jobSchema', () => {
    it('should validate structured job creation inputs successfully', () => {
      const payload = {
        title: 'Full Stack Engineer',
        description: 'Looking for a senior full stack developer with React/Node expertise.',
        requirements: 'Must have 5+ years of experience.',
        applyUrl: 'https://careers.google.com/apply',
        verifiedSource: true,
        type: 'Full-time' as const,
        location: 'Sunnyvale, CA',
        salaryRange: '$120k - $150k',
        skills: 'React, Node, SQL',
        companyId: 'comp-uuid',
        categoryId: 'cat-uuid',
      };
      const result = jobSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid apply Url values', () => {
      const payload = {
        title: 'Full Stack Engineer',
        description: 'Looking for a senior full stack developer with React/Node expertise.',
        applyUrl: 'invalid-url-format',
        type: 'Full-time' as const,
        location: 'Sunnyvale, CA',
        companyId: 'comp-uuid',
        categoryId: 'cat-uuid',
      };
      const result = jobSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
