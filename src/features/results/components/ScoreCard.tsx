import { cn } from '../../../lib/utils/cn';
import { Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import type { TestResult } from '../../test-taking/types';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

interface ScoreCardProps {
  result: TestResult;
}

export function ScoreCard({ result }: ScoreCardProps) {
  const pct = Math.round(result.percentageScore);
  const accuracyPct = Math.round(result.accuracy * 100);

  const scoreColor =
    pct >= 75
      ? 'text-emerald-600 dark:text-emerald-400'
      : pct >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  const badgeBg =
    pct >= 75
      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
      : pct >= 50
        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
        : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300';

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Result link copied to clipboard.');
  };

  return (
    <Card className="p-6 print:shadow-none">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Score */}
        <div>
          <p className="text-sm font-semibold uppercase text-muted">Your score</p>
          <p className={cn('mt-2 text-6xl font-bold tabular-nums', scoreColor)}>
            {result.scoredMarks}
            <span className="text-3xl text-muted">/{result.totalMarks}</span>
          </p>
          <span className={cn('mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold', badgeBg)}>
            {pct}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 print:hidden">
          <Button
            onClick={() => window.print()}
            type="button"
            variant="secondary"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={() => void handleShare()} type="button" variant="secondary">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats */}
      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
        <Stat label="Correct" value={result.correctCount} />
        <Stat label="Incorrect" value={result.incorrectCount} />
        <Stat label="Skipped" value={result.skippedCount} />
        <Stat label="Accuracy" value={`${accuracyPct}%`} />
      </dl>
    </Card>
  );
}
