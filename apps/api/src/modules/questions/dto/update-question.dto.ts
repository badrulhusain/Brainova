import { z } from 'zod';

export const UpdateQuestionSchema = z.object({
  type: z.enum(['MCQ', 'TRUE_FALSE', 'FILL']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  text: z.string().min(1).max(2000).optional(),
  options: z.array(z.string().min(1)).min(2).max(6).optional(),
  marks: z.number().positive().optional(),
  negativeMarks: z.number().min(0).optional(),
  timeRecommended: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  answerKey: z
    .object({
      correctAnswer: z.string().min(1),
      explanation: z.string().min(1).max(2000),
    })
    .optional(),
});

export type UpdateQuestionDto = z.infer<typeof UpdateQuestionSchema>;
