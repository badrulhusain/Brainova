import { Bookmark, BookmarkCheck, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils/cn';
import type { SnapshotQuestion } from '../types';

interface QuestionCardProps {
  question: SnapshotQuestion;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  isMarked: boolean;
  onAnswer: (answer: string) => void;
  onClear: () => void;
  onToggleMark: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  isMarked,
  onAnswer,
  onClear,
  onToggleMark,
  onNext,
  onPrev,
}: QuestionCardProps) {
  const isFirst = questionNumber === 1;
  const isLast = questionNumber === totalQuestions;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
              question.difficulty === 'easy'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : question.difficulty === 'medium'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
            )}
          >
            {question.difficulty}
          </span>
          <span className="rounded-full border border-border bg-surfaceSoft px-2.5 py-0.5 text-xs text-muted">
            {question.marks} mark{question.marks !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          aria-label={isMarked ? 'Remove from review' : 'Mark for review'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            isMarked
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
              : 'text-muted hover:bg-surfaceSoft hover:text-foreground',
          )}
          onClick={onToggleMark}
          type="button"
        >
          {isMarked ? (
            <BookmarkCheck className="h-3.5 w-3.5" />
          ) : (
            <Bookmark className="h-3.5 w-3.5" />
          )}
          {isMarked ? 'Marked' : 'Mark for review'}
        </button>
      </div>

      {/* Question text */}
      <div className="rounded-lg border border-border bg-surfaceSoft p-5">
        <p className="whitespace-pre-wrap leading-7 text-foreground">{question.text}</p>
      </div>

      {/* Answer area */}
      {question.type === 'fill' ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-muted" htmlFor="fill-answer">
            Your answer
          </label>
          <Input
            id="fill-answer"
            placeholder="Type your answer…"
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, idx) => {
            const isSelected = answer === option;
            return (
              <button
                key={idx}
                aria-pressed={isSelected}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition-colors',
                  isSelected
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200'
                    : 'border-border bg-surface text-foreground hover:bg-surfaceSoft',
                )}
                onClick={() => {
                  if (isSelected) {
                    onClear();
                  } else {
                    onAnswer(option);
                  }
                }}
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
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          {answer && (
            <button
              className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
              onClick={onClear}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
              Clear response
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            disabled={isFirst}
            onClick={onPrev}
            type="button"
            variant="secondary"
          >
            Previous
          </Button>
          {!isLast && (
            <Button onClick={onNext} type="button">
              Save &amp; Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
