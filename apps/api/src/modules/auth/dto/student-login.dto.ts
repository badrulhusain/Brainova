import { z } from 'zod';

export const studentLoginSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  admissionNo: z.string().trim().min(1, 'Admission number is required'),
});

export type StudentLoginDto = z.infer<typeof studentLoginSchema>;
