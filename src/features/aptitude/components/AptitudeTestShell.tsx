import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { cn } from '../../../lib/utils/cn';
import { APTITUDE_LABELS, type AptitudeQuestion } from '../types';

interface AptitudeTestShellProps {
  questions: AptitudeQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
  isSubmitting: boolean;
}

export function AptitudeTestShell({ questions, onSubmit, isSubmitting }: AptitudeTestShellProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[question.id])).length,
    [answers, questions],
  );
  const allAnswered = answeredCount === questions.length;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (!currentQuestion) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center text-muted">
        No aptitude questions are available right now.
      </Card>
    );
  }

  const selectedAnswer = answers[currentQuestion.id] ?? '';
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="rounded-full border border-border bg-surfaceSoft px-2.5 py-0.5 text-xs">
              {APTITUDE_LABELS[currentQuestion.category]}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surfaceSoft">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surfaceSoft p-5">
          <p className="whitespace-pre-wrap text-lg font-medium leading-8 text-foreground">
            {currentQuestion.text}
          </p>
        </div>

        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Aptitude answer options">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={`${currentQuestion.id}-${idx}`}
                aria-pressed={isSelected}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition-colors',
                  isSelected
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200'
                    : 'border-border bg-surface text-foreground hover:bg-surfaceSoft',
                )}
                onClick={() =>
                  setAnswers((current) => ({ ...current, [currentQuestion.id]: option }))
                }
                type="button"
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs',
                    isSelected
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-border bg-background',
                  )}
                >
                  {isSelected && '✓'}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            disabled={isFirst || isSubmitting}
            onClick={() => setCurrentIndex((idx) => idx - 1)}
            type="button"
            variant="secondary"
          >
            Previous
          </Button>
          {isLast ? (
            <Button
              disabled={!allAnswered || isSubmitting}
              onClick={() => onSubmit(answers)}
              type="button"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          ) : (
            <Button
              disabled={!selectedAnswer || isSubmitting}
              onClick={() => setCurrentIndex((idx) => idx + 1)}
              type="button"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
