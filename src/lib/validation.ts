import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
  applyUrl: z.string().url('Invalid URL format'),
  verifiedSource: z.boolean().default(false),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Remote']),
  location: z.string().min(2, 'Location is required'),
  salaryRange: z.string().optional(),
  skills: z.string().optional(),
  companyId: z.string().min(1, 'Company is required'),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

export const companySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  website: z.string().url('Invalid website URL'),
  logoUrl: z.string().url('Invalid logo URL').or(z.string().length(0)).optional(),
  description: z.string().optional(),
  verified: z.boolean().default(false),
});

export const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().optional(),
  coverImage: z.string().url('Invalid image URL').or(z.string().length(0)).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

export const resourceSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  type: z.enum(['INTERVIEW_QUESTION', 'PLACEMENT_PAPER']),
  content: z.string().min(10, 'Content is required'),
  category: z.string().optional(),
});

export const adSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  placement: z.enum(['SIDEBAR', 'BANNER', 'INLINE']),
  imageUrl: z.string().url('Invalid image URL'),
  targetUrl: z.string().url('Invalid target URL'),
  active: z.boolean().default(true),
});
