import { z } from 'zod';

export const setUserRoleSchema = z.object({
  uid: z.string().min(1).max(128),
  admin: z.boolean(),
});

export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;
