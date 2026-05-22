import { z } from 'zod';

export const CreateStudentSchema = z.object({
  name: z.string().min(1).max(100),
  admissionNo: z.string().min(1).max(50),
  department: z.string().min(1).max(100).optional(),
  batch: z.string().min(1).max(20).optional(),
});

export type CreateStudentDto = z.infer<typeof CreateStudentSchema>;
