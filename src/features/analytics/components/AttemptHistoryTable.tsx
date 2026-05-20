import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ThemeAwareSkeleton } from '../../../components/ui/theme-toggle';
import { useAttemptHistory } from '../hooks/useAttemptHistory';
import type { TestAttemptSummary } from '../../test-taking/types';

interface AttemptHistoryTableProps {
  uid: string;
}

function AttemptRow({ attempt }: { attempt: TestAttemptSummary }) {
  const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;

  return (
    <tr className="transition hover:bg-surfaceSoft">
      <td className="px-4 py-3 text-xs text-muted tabular-nums">
        {attempt.date.toDate().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </td>
      <td className="px-4 py-3 text-sm text-muted">{attempt.domainId}</td>
      <td className="px-4 py-3 text-right tabular-nums">
        {attempt.score}/{attempt.totalMarks}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{pct}%</td>
      <td className="px-4 py-3 text-right tabular-nums">
        {Math.round(attempt.accuracy * 100)}%
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
          to={`/results/${attempt.resultId}`}
        >
          View <ExternalLink className="h-3 w-3" />
        </Link>
      </td>
    </tr>
  );
}

export function AttemptHistoryTable({ uid }: AttemptHistoryTableProps) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAttemptHistory(uid);

  const attempts = data?.pages.flatMap((p) => p.attempts) ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((n) => (
          <ThemeAwareSkeleton key={n} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-700 dark:text-red-300">
        Failed to load attempt history.
      </p>
    );
  }

  if (attempts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No completed tests yet.{' '}
        <Link className="text-brand-600 underline" to="/tests">
          Take your first test.
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surfaceSoft">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted">Domain</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">Score</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">%</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">Accuracy</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {attempts.map((attempt) => (
              <AttemptRow key={attempt.id} attempt={attempt} />
            ))}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div className="text-center">
          <Button
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            type="button"
            variant="secondary"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
