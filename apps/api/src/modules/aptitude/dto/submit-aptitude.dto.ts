import { z } from 'zod';

export const SubmitAptitudeSchema = z.object({
  answers: z.record(z.string()),
});

export type SubmitAptitudeDto = z.infer<typeof SubmitAptitudeSchema>;
