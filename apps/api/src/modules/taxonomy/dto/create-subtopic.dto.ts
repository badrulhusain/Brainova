import { z } from 'zod';

export const CreateSubtopicSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  order: z.number().int().min(0).default(0),
});

export type CreateSubtopicDto = z.infer<typeof CreateSubtopicSchema>;
