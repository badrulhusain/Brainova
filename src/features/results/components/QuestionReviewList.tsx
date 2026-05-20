import { useState } from 'react';
import type { QuestionResult } from '../../test-taking/types';
import { QuestionReviewItem } from './QuestionReviewItem';

type FilterMode = 'all' | 'incorrect' | 'marked';

interface QuestionReviewListProps {
  questionResults: QuestionResult[];
  markedForReview: Record<string, boolean>;
}

const FILTERS: { label: string; value: FilterMode }[] = [
  { label: 'Show all', value: 'all' },
  { label: 'Incorrect only', value: 'incorrect' },
  { label: 'Marked for review', value: 'marked' },
];

export function QuestionReviewList({
  questionResults,
  markedForReview,
}: QuestionReviewListProps) {
  const [filter, setFilter] = useState<FilterMode>('all');

  const filtered = questionResults.filter((r) => {
    if (filter === 'incorrect') return !r.isCorrect;
    if (filter === 'marked') return Boolean(markedForReview[r.questionId]);
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Question review</h2>
        <div className="flex rounded-lg border border-border bg-surface p-1">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              className={
                filter === value
                  ? 'rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition'
                  : 'rounded-md px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground'
              }
              onClick={() => setFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No questions match this filter.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r, idx) => (
            <QuestionReviewItem key={r.questionId} result={r} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
