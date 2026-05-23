import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, SearchCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { useAdminResults } from '../../features/admin/hooks/useAdminResults';
import type { AdminResultRecord } from '../../features/admin/types';

function formatDate(value: string | null) {
  if (!value) return 'Not submitted';

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ResultRow({ result }: { result: AdminResultRecord }) {
  return (
    <tr className="transition hover:bg-surfaceSoft">
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">
          {result.student?.name ?? 'Unknown student'}
        </p>
        <p className="font-mono text-xs text-muted">
          {result.student?.admissionNo ?? result.studentId}
        </p>
      </td>
      <td className="px-4 py-3 text-sm text-muted">
        {result.config?.name ?? result.domain?.name ?? result.domainId}
      </td>
      <td className="px-4 py-3 text-right font-numeric">
        {result.scoredMarks}/{result.totalMarks}
      </td>
      <td className="px-4 py-3 text-right font-numeric">
        {Math.round(result.percentageScore)}%
      </td>
      <td className="px-4 py-3 text-right font-numeric">
        {Math.round(result.accuracy)}%
      </td>
      <td className="px-4 py-3 text-right text-xs text-muted">
        {formatDate(result.submittedAt ?? result.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
          to={`/admin/results/${result.id}`}
        >
          View <ExternalLink aria-hidden="true" className="h-3 w-3" />
        </Link>
      </td>
    </tr>
  );
}

export default function AdminResultsPage() {
  const [page, setPage] = useState(1);
  const resultsQuery = useAdminResults(page);
  const results = resultsQuery.data?.items ?? [];

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">
              Admin Console
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Student results
            </h1>
            <p className="mt-2 text-muted">
              Review submitted test scores for every student.
            </p>
          </div>
          <Card className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
              <SearchCheck aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="font-numeric text-2xl font-semibold">
                {resultsQuery.isLoading ? '--' : resultsQuery.data?.total ?? 0}
              </p>
              <p className="text-sm text-muted">Total results</p>
            </div>
          </Card>
        </section>

        {resultsQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((item) => (
              <ThemeAwareSkeleton key={item} className="h-14 w-full" />
            ))}
          </div>
        ) : resultsQuery.isError ? (
          <Card className="p-6 text-sm text-red-700 dark:text-red-300">
            Failed to load student results. Check your admin access and API connection.
          </Card>
        ) : results.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted">
            No submitted results found.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surfaceSoft">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Test</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">Score</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">%</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">Accuracy</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {results.map((result) => (
                  <ResultRow key={result.id} result={result} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {resultsQuery.data && resultsQuery.data.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <Button
              disabled={page <= 1 || resultsQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
              variant="secondary"
            >
              Previous
            </Button>
            <span className="text-sm text-muted">
              Page {resultsQuery.data.page} of {resultsQuery.data.totalPages}
            </span>
            <Button
              disabled={page >= resultsQuery.data.totalPages || resultsQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
              type="button"
              variant="secondary"
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
