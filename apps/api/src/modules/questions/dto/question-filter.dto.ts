import { z } from 'zod';

export const QuestionFilterSchema = z.object({
  domainId: z.string().optional(),
  topicId: z.string().optional(),
  subtopicId: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  type: z.enum(['MCQ', 'TRUE_FALSE', 'FILL']).optional(),
  active: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type QuestionFilterDto = z.infer<typeof QuestionFilterSchema>;
