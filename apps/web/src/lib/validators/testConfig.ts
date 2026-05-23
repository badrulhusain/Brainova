import { z } from 'zod';

export const testConfigSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters.').max(200),
    description: z.string().min(8, 'Description must be at least 8 characters.').max(800),
    domainId: z.string().min(1, 'Select a domain.'),
    totalQuestions: z.union([
      z.literal(10),
      z.literal(15),
      z.literal(20),
      z.literal(25),
      z.literal(30),
    ]),
    duration: z
      .number()
      .int()
      .min(300, 'Minimum duration is 5 minutes.')
      .max(10800, 'Maximum duration is 3 hours.'),
    marksPerQuestion: z.number().min(0.25).max(20),
    negativeMarksRatio: z.number().min(0, 'Must be 0 or more.').max(1, 'Must be 1 or less.'),
    difficultyDistribution: z.object({
      easy: z.number().int().min(0),
      medium: z.number().int().min(0),
      hard: z.number().int().min(0),
    }),
    topicFilter: z.array(z.string()),
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
    active: z.boolean(),
  })
  .superRefine((value, context) => {
    const sum =
      value.difficultyDistribution.easy +
      value.difficultyDistribution.medium +
      value.difficultyDistribution.hard;
    if (sum !== value.totalQuestions) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Easy + Medium + Hard must equal total questions (${value.totalQuestions}). Current sum: ${sum}.`,
        path: ['difficultyDistribution'],
      });
    }
  });

export type TestConfigInput = z.infer<typeof testConfigSchema>;
