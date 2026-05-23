import { cn } from '../../../lib/utils/cn';
import type { SnapshotQuestion } from '../types';

interface QuestionNavigatorProps {
  questions: SnapshotQuestion[];
  answers: Record<string, string>;
  markedForReview: Record<string, boolean>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

function getButtonStyle(
  questionId: string,
  isCurrent: boolean,
  answers: Record<string, string>,
  markedForReview: Record<string, boolean>,
): string {
  const answered = Boolean(answers[questionId]);
  const marked = Boolean(markedForReview[questionId]);

  if (isCurrent) {
    return 'ring-2 ring-brand-500 ring-offset-1 ring-offset-background bg-brand-600 text-white';
  }
  if (answered && marked) {
    return 'bg-emerald-600 text-white border-emerald-700';
  }
  if (answered) {
    return 'bg-sky-600 text-white border-sky-700';
  }
  if (marked) {
    return 'bg-amber-500 text-white border-amber-600';
  }
  return 'bg-surface text-muted border-border hover:bg-surfaceSoft hover:text-foreground';
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <span className={cn('inline-block h-3 w-3 rounded-sm', color)} />
      {label}
    </div>
  );
}

export function QuestionNavigator({
  questions,
  answers,
  markedForReview,
  currentIndex,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground">Question navigator</h3>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            aria-label={`Question ${idx + 1}`}
            aria-pressed={idx === currentIndex}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded border text-xs font-semibold transition-colors',
              getButtonStyle(q.id, idx === currentIndex, answers, markedForReview),
            )}
            onClick={() => onNavigate(idx)}
            type="button"
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        <Legend color="bg-sky-600" label="Answered" />
        <Legend color="bg-amber-500" label="Marked" />
        <Legend color="bg-emerald-600" label="Answered + Marked" />
        <Legend color="bg-surfaceSoft border border-border" label="Not answered" />
      </div>

      <div className="mt-2 flex flex-col gap-0.5 rounded-lg border border-border bg-surfaceSoft p-3 text-xs text-muted">
        <div className="flex justify-between">
          <span>Answered</span>
          <span className="font-semibold text-foreground">
            {Object.keys(answers).filter((k) => answers[k]).length} / {questions.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Not answered</span>
          <span className="font-semibold text-foreground">
            {questions.length - Object.keys(answers).filter((k) => answers[k]).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Marked for review</span>
          <span className="font-semibold text-foreground">
            {Object.values(markedForReview).filter(Boolean).length}
          </span>
        </div>
      </div>
    </div>
  );
}
