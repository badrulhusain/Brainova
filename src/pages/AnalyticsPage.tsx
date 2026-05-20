import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { ScoreTrendChart } from '../features/analytics/components/ScoreTrendChart';
import { AccuracyByDifficultyChart } from '../features/analytics/components/AccuracyByDifficultyChart';
import { WeakTopicsPanel } from '../features/analytics/components/WeakTopicsPanel';
import { AttemptHistoryTable } from '../features/analytics/components/AttemptHistoryTable';
import { useAttemptHistory } from '../features/analytics/hooks/useAttemptHistory';
import { Card } from '../components/ui/card';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? '';

  const { data } = useAttemptHistory(uid);
  const attempts = data?.pages.flatMap((p) => p.attempts) ?? [];

  if (!user) {
    return (
      <main className="bg-background px-4 py-8 text-foreground sm:px-6">
        <Card className="mx-auto max-w-sm p-8 text-center text-muted">
          You must be signed in to view analytics.
        </Card>
      </main>
    );
  }

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">My analytics</h1>
        <p className="mt-2 text-muted">
          Track your performance trends across all test attempts.{' '}
          <Link className="text-brand-600 underline" to="/tests">
            Take a test
          </Link>
        </p>

        <div className="mt-8 flex flex-col gap-6">
          {/* Charts row */}
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreTrendChart attempts={attempts} />
            <AccuracyByDifficultyChart attempts={attempts} />
          </div>

          {/* Weak topics */}
          <WeakTopicsPanel uid={uid} />

          {/* Attempt history */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Attempt history</h2>
            <AttemptHistoryTable uid={uid} />
          </section>
        </div>
      </div>
    </main>
  );
}
