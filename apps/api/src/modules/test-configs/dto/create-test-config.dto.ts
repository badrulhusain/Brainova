import { z } from 'zod';

export const CreateTestConfigSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    domainId: z.string().min(1),
    totalQuestions: z.number().int().positive(),
    duration: z.number().int().positive(),       // seconds
    marksPerQuestion: z.number().positive().default(1),
    negativeMarksRatio: z.number().min(0).default(0.25),
    easyCount: z.number().int().min(0),
    mediumCount: z.number().int().min(0),
    hardCount: z.number().int().min(0),
    topicFilter: z.array(z.string()).default([]),
    shuffleQuestions: z.boolean().default(true),
    shuffleOptions: z.boolean().default(false),
  })
  .refine(
    (d) => d.easyCount + d.mediumCount + d.hardCount === d.totalQuestions,
    {
      message: 'easyCount + mediumCount + hardCount must equal totalQuestions',
      path: ['totalQuestions'],
    },
  );

export type CreateTestConfigDto = z.infer<typeof CreateTestConfigSchema>;
