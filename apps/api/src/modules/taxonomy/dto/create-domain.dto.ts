import { z } from 'zod';

export const CreateDomainSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  icon: z.string().min(1).max(50),
  order: z.number().int().min(0).default(0),
});

export type CreateDomainDto = z.infer<typeof CreateDomainSchema>;
