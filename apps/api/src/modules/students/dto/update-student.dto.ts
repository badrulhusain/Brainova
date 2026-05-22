import { z } from 'zod';

export const UpdateStudentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  batch: z.string().min(1).max(20).optional(),
});

export type UpdateStudentDto = z.infer<typeof UpdateStudentSchema>;
