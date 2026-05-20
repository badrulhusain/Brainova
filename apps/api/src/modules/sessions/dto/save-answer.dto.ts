import { z } from 'zod';

export const SaveAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

export const ToggleReviewSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
});

export const TabSwitchSchema = z.object({
  sessionId: z.string().min(1),
});

export type SaveAnswerDto = z.infer<typeof SaveAnswerSchema>;
export type ToggleReviewDto = z.infer<typeof ToggleReviewSchema>;
export type TabSwitchDto = z.infer<typeof TabSwitchSchema>;
