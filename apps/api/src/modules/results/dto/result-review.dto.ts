import type { ResultSummaryDto } from './result-summary.dto';

/**
 * Full result for the question-review screen.
 * Extends ResultSummaryDto with questionResults, which includes
 * correctAnswer and explanation for each question.
 *
 * SECURITY: only returned to the result owner (userId check in service).
 * Returned by GET /results/:id.
 */
export interface ResultReviewDto extends ResultSummaryDto {
  /** JSON array of QuestionResultEntry objects produced by ScoringService */
  questionResults: unknown;
}
