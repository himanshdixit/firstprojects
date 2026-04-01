import { z } from 'zod';
import { hasMeaningfulRichText } from '@/lib/richText';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().refine((value) => hasMeaningfulRichText(value, 20), {
    message: 'Content must be at least 20 characters of actual text',
  }),
  status: z.enum(['draft', 'published']),
  tags: z.string().optional(),
  category: z.string().max(60, 'Category must be at most 60 characters').optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(160, 'Subject must be at most 160 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000, 'Message must be at most 5000 characters'),
});
