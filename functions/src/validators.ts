import { z } from 'zod';

export const setUserRoleSchema = z.object({
  uid: z.string().min(1).max(128),
  admin: z.boolean(),
});

export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;

export const createTestSessionSchema = z.object({
  configId: z.string().min(1).max(128),
});

export type CreateTestSessionInput = z.infer<typeof createTestSessionSchema>;

export const submitTestSchema = z.object({
  sessionId: z.string().min(1).max(128),
});

export type SubmitTestInput = z.infer<typeof submitTestSchema>;
