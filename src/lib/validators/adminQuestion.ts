import { z } from 'zod';

export const adminQuestionSchema = z
  .object({
    domain: z.string().min(1, 'Select a domain.'),
    topic: z.string().min(1, 'Select a topic.'),
    subtopic: z.string().min(1, 'Select a subtopic.'),
    type: z.enum(['mcq', 'true_false', 'fill']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    text: z.string().min(8, 'Question text must be at least 8 characters.').max(1200),
    options: z.array(z.string().min(1)).max(8),
    correctAnswer: z.string().min(1, 'Enter the correct answer.'),
    explanation: z.string().min(8, 'Explanation must be at least 8 characters.').max(1600),
    marks: z.number().min(0.25).max(20),
    negativeMarks: z.number().min(0).max(20),
    timeRecommended: z.number().int().min(15).max(600),
    tags: z.array(z.string().min(1)).max(12),
    active: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.type === 'mcq' && value.options.length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'MCQ questions need at least two options.',
        path: ['options'],
      });
    }

    if (value.type === 'true_false') {
      const trueFalseOptions = value.options.join('|');

      if (trueFalseOptions !== 'True|False') {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'True/false questions must use True and False options.',
          path: ['options'],
        });
      }
    }

    if (value.type !== 'fill' && !value.options.includes(value.correctAnswer)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Correct answer must match one of the public options.',
        path: ['correctAnswer'],
      });
    }
  });

export type AdminQuestionInput = z.infer<typeof adminQuestionSchema>;
