import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ThemeAwareSkeleton } from '../components/ui/theme-toggle';
import { useActiveTestConfigs } from '../features/test-config/hooks/useTestConfigs';
import { useDomains } from '../features/test-taking/hooks/useDomains';

interface CreateSessionResult {
  sessionId: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

export default function TestsPage() {
  const navigate = useNavigate();
  const configsQuery = useActiveTestConfigs();
  const domainsQuery = useDomains();
  const [startingConfigId, setStartingConfigId] = useState<string | null>(null);

  const domains = domainsQuery.data ?? [];
  const configs = configsQuery.data ?? [];

  const domainMap = Object.fromEntries(domains.map((d) => [d.id, d]));

  const configsByDomain = domains.reduce<Record<string, typeof configs>>(
    (acc, domain) => {
      acc[domain.id] = configs.filter((c) => c.domainId === domain.id);
      return acc;
    },
    {},
  );

  const handleStartTest = async (configId: string) => {
    setStartingConfigId(configId);
    try {
      const createSession = httpsCallable<{ configId: string }, CreateSessionResult>(
        functions,
        'createTestSession',
      );
      const result = await createSession({ configId });
      navigate(`/tests/${result.data.sessionId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start test. Please try again.';
      if (message.includes('already-exists')) {
        toast.error('You already have an active session for this test.');
      } else {
        toast.error(message);
      }
    } finally {
      setStartingConfigId(null);
    }
  };

  const isLoading = configsQuery.isLoading || domainsQuery.isLoading;

  if (isLoading) {
    return (
      <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
        <div className="mx-auto w-full max-w-4xl">
          <ThemeAwareSkeleton className="mb-6 h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <ThemeAwareSkeleton key={n} className="h-44 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (configsQuery.isError) {
    return (
      <main className="bg-background px-4 py-8 text-foreground sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <Card className="flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Failed to load tests. Please refresh.
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">Available tests</h1>
        <p className="mt-2 text-muted">Select a test to begin. Each attempt is timed and scored on the server.</p>

        {configs.length === 0 ? (
          <Card className="mt-8 py-12 text-center text-muted">
            No tests available right now. Check back soon.
          </Card>
        ) : (
          <div className="mt-8 flex flex-col gap-10">
            {domains.map((domain) => {
              const domainConfigs = configsByDomain[domain.id] ?? [];
              if (domainConfigs.length === 0) return null;

              return (
                <section key={domain.id}>
                  <h2 className="mb-4 text-xl font-semibold">{domain.name}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {domainConfigs.map((config) => (
                      <Card key={config.id} className="flex flex-col gap-4 p-5">
                        <div>
                          <h3 className="font-semibold text-foreground">{config.name}</h3>
                          <p className="mt-1 text-sm text-muted">{config.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {config.totalQuestions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(config.duration)}
                          </span>
                          <span>
                            {config.marksPerQuestion} mark{config.marksPerQuestion !== 1 ? 's' : ''}/Q
                          </span>
                          {config.negativeMarksRatio > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">
                              -{config.negativeMarksRatio * config.marksPerQuestion} negative
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 text-xs text-muted">
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {config.difficultyDistribution.easy} easy
                          </span>
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            {config.difficultyDistribution.medium} medium
                          </span>
                          <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                            {config.difficultyDistribution.hard} hard
                          </span>
                        </div>
                        <Button
                          className="mt-auto w-full"
                          disabled={startingConfigId !== null}
                          onClick={() => void handleStartTest(config.id)}
                          type="button"
                        >
                          {startingConfigId === config.id ? 'Starting…' : 'Start test'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* configs with unknown domain */}
            {(() => {
              const orphaned = configs.filter((c) => !domainMap[c.domainId]);
              if (orphaned.length === 0) return null;
              return (
                <section>
                  <h2 className="mb-4 text-xl font-semibold">Other</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {orphaned.map((config) => (
                      <Card key={config.id} className="flex flex-col gap-4 p-5">
                        <div>
                          <h3 className="font-semibold">{config.name}</h3>
                          <p className="mt-1 text-sm text-muted">{config.description}</p>
                        </div>
                        <Button
                          className="w-full"
                          disabled={startingConfigId !== null}
                          onClick={() => void handleStartTest(config.id)}
                          type="button"
                        >
                          {startingConfigId === config.id ? 'Starting…' : 'Start test'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })()}
          </div>
        )}
      </div>
    </main>
  );
}
