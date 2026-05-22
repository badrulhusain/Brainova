import { z } from 'zod';

export const studentLoginSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.'),
  admissionNo: z.string().trim().min(1, 'Enter your admission number.'),
});

export const studentRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  admissionNo: z.string().trim().min(1, 'Enter your admission number.'),
  department: z.string().trim().min(1).max(100).optional().or(z.literal('')),
  batch: z.string().trim().min(1).max(20).optional().or(z.literal('')),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const createAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'At least 3 characters.')
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores.'),
  password: z.string().min(8, 'At least 8 characters.'),
});

export type StudentLoginValues = z.infer<typeof studentLoginSchema>;
export type StudentRegisterValues = z.infer<typeof studentRegisterSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type CreateAdminValues = z.infer<typeof createAdminSchema>;
