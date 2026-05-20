import { z } from 'zod';

export const UpdateTestConfigSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(1000).optional(),
    totalQuestions: z.number().int().positive().optional(),
    duration: z.number().int().positive().optional(),
    marksPerQuestion: z.number().positive().optional(),
    negativeMarksRatio: z.number().min(0).optional(),
    easyCount: z.number().int().min(0).optional(),
    mediumCount: z.number().int().min(0).optional(),
    hardCount: z.number().int().min(0).optional(),
    topicFilter: z.array(z.string()).optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const { easyCount, mediumCount, hardCount, totalQuestions } = data;
    const anyCountField =
      easyCount !== undefined ||
      mediumCount !== undefined ||
      hardCount !== undefined ||
      totalQuestions !== undefined;

    if (!anyCountField) return;

    // If any count-related field is updated, all four must be supplied together
    // so the constraint can be validated atomically.
    const allCountFields =
      easyCount !== undefined &&
      mediumCount !== undefined &&
      hardCount !== undefined &&
      totalQuestions !== undefined;

    if (!allCountFields) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'When updating question counts, supply easyCount, mediumCount, hardCount, and totalQuestions together',
      });
      return;
    }

    if (easyCount + mediumCount + hardCount !== totalQuestions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'easyCount + mediumCount + hardCount must equal totalQuestions',
        path: ['totalQuestions'],
      });
    }
  });

export type UpdateTestConfigDto = z.infer<typeof UpdateTestConfigSchema>;
