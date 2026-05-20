import { z } from 'zod';

export const CreateQuestionSchema = z.object({
  domainId: z.string().min(1),
  topicId: z.string().min(1),
  subtopicId: z.string().min(1),
  type: z.enum(['MCQ', 'TRUE_FALSE', 'FILL']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  text: z.string().min(1).max(2000),
  options: z.array(z.string().min(1)).min(2).max(6),
  marks: z.number().positive().default(1),
  negativeMarks: z.number().min(0).default(0.25),
  timeRecommended: z.number().int().positive().default(60),
  tags: z.array(z.string()).default([]),
  answerKey: z.object({
    correctAnswer: z.string().min(1),
    explanation: z.string().min(1).max(2000),
  }),
});

export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;
