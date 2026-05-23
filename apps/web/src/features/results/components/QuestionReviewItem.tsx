import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';
import type { QuestionResult } from '../../test-taking/types';

interface QuestionReviewItemProps {
  result: QuestionResult;
  index: number;
}

export function QuestionReviewItem({ result, index }: QuestionReviewItemProps) {
  const isSkipped = result.status === 'SKIPPED';
  const isCorrect = result.status === 'CORRECT';

  const statusIcon = isSkipped ? (
    <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
  ) : isCorrect ? (
    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
  ) : (
    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
  );

  const borderColor = isSkipped
    ? 'border-border'
    : isCorrect
      ? 'border-emerald-200 dark:border-emerald-900'
      : 'border-red-200 dark:border-red-900';

  return (
    <div className={cn('rounded-lg border p-5 print:break-inside-avoid', borderColor)}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {statusIcon}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">Q{index + 1}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                result.difficulty === 'EASY'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : result.difficulty === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
              )}
            >
              {result.difficulty}
            </span>
            <span className="rounded-full border border-border bg-surfaceSoft px-2 py-0.5 text-xs text-muted">
              {result.topicId}
            </span>
            <span
              className={cn(
                'ml-auto text-xs font-semibold',
                result.marks > 0
                  ? 'text-emerald-600'
                  : result.marks < 0
                    ? 'text-red-600'
                    : 'text-muted',
              )}
            >
              {result.marks > 0 ? '+' : ''}
              {result.marks} marks
            </span>
          </div>
          <p className="mt-2 leading-6 text-foreground">{result.text}</p>
        </div>
      </div>

      {/* Options for MCQ/true_false */}
      {(result.type === 'MCQ' || result.type === 'TRUE_FALSE') &&
        result.options.length > 0 && (
          <div className="mt-3 grid gap-1.5 pl-7">
            {result.options.map((option, idx) => {
              const isUser = result.userAnswer === option;
              const isCorrect = result.correctAnswer === option;
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm',
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                      : isUser
                        ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200'
                        : 'text-muted',
                  )}
                >
                  {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                  {isUser && !isCorrect && (
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-red-600" />
                  )}
                  {!isCorrect && !isUser && (
                    <span className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {option}
                </div>
              );
            })}
          </div>
        )}

      {/* Fill answer */}
      {result.type === 'FILL' && (
        <div className="mt-3 pl-7 text-sm">
          <p>
            <span className="text-muted">Your answer: </span>
            <span
              className={cn(
                'font-medium',
                isSkipped
                  ? 'text-muted italic'
                  : isCorrect
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400',
              )}
            >
              {isSkipped ? 'Not answered' : result.userAnswer}
            </span>
          </p>
          {!isCorrect && (
            <p className="mt-1">
              <span className="text-muted">Correct answer: </span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                {result.correctAnswer}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Explanation */}
      {result.explanation && (
        <div className="mt-3 rounded-md bg-surfaceSoft px-3 py-2 pl-7 text-sm text-muted">
          <span className="font-medium text-foreground">Explanation: </span>
          {result.explanation}
        </div>
      )}
    </div>
  );
}
