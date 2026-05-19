import { z } from 'zod';

export const emailSchema = z.string().trim().email('Enter a valid email address.').max(254);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be 128 characters or less.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(128),
});

export const signupSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Enter your name.').max(80, 'Name must be 80 characters or less.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
