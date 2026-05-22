import { z } from 'zod';

export const SaveAnswersSchema = z.object({
  answers: z.record(z.string()),
  markedForReview: z.record(z.boolean()).optional(),
});

export const SaveAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

export const ToggleReviewSchema = z.object({
  questionId: z.string().min(1),
});

export type SaveAnswersDto = z.infer<typeof SaveAnswersSchema>;
export type SaveAnswerDto = z.infer<typeof SaveAnswerSchema>;
export type ToggleReviewDto = z.infer<typeof ToggleReviewSchema>;
