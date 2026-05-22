import { z } from 'zod';

export const CreateAdminSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  password: z.string().min(8).max(100),
});

export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
