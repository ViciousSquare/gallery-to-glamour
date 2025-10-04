import { z } from 'zod';

export const contactSubmissionSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  company: z.string().max(255).optional(),
  role: z.string().max(100).optional(),
  interestArea: z.string().max(100).optional(),
  goals: z.string().max(2000, "Goals must be less than 2000 characters").optional(),
});

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().min(1, "Description is required").max(2000),
  category: z.string().min(1, "Category is required").max(100),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  url: z.string().url("Please enter a valid URL").max(1000),
  eligibility: z.string().max(500).optional().nullable(),
  deadline: z.string().max(200).optional().nullable(),
  featured: z.boolean(),
});

export const coachSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  bio: z.string().max(2000, "Bio must be less than 2000 characters").optional().nullable(),
  linkedin_url: z.string().url("Please enter a valid LinkedIn URL").max(500).optional().nullable().or(z.literal('')),
  image_url: z.string().url().max(1000).optional().nullable().or(z.literal('')),
  display_order: z.number().int().min(0),
  active: z.boolean(),
});