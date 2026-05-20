export type QuestionStatus = 'CORRECT' | 'INCORRECT' | 'SKIPPED';

export interface MarkInput {
  userAnswer: string | null | undefined;
  correctAnswer: string;
  marksPerQuestion: number;
  negativeMarks: number;
}

export interface MarkOutput {
  status: QuestionStatus;
  marks: number;
}

/**
 * Pure, side-effect-free mark calculator for a single question.
 *
 * Rules:
 *   - No answer provided  → SKIPPED,   marks = 0
 *   - Exact string match  → CORRECT,   marks = +marksPerQuestion
 *   - Any other answer    → INCORRECT, marks = -negativeMarks
 *
 * The caller is responsible for flooring the running total at 0
 * (a single question can go negative but the final score cannot).
 */
export function calculateMarks(input: MarkInput): MarkOutput {
  if (!input.userAnswer) {
    return { status: 'SKIPPED', marks: 0 };
  }

  if (input.userAnswer === input.correctAnswer) {
    return { status: 'CORRECT', marks: input.marksPerQuestion };
  }

  return { status: 'INCORRECT', marks: -input.negativeMarks };
}
