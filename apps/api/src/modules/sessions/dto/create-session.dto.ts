import { z } from 'zod';

export const CreateSessionSchema = z.object({
  configId: z.string().min(1),
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
