/**
 * Score-card only — questionResults is intentionally excluded.
 * Returned by GET /results/:id/summary.
 */
export interface ResultSummaryDto {
  id: string;
  sessionId: string;
  userId: string;
  domainId: string;
  configId: string;
  scoredMarks: number;
  totalMarks: number;
  percentageScore: number;
  accuracy: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  topicBreakdown: unknown;
  difficultyBreakdown: unknown;
  createdAt: Date;
  session: {
    startedAt: Date;
    submittedAt: Date | null;
    tabSwitchCount: number;
    config: { name: string; duration: number };
  } | null;
}
