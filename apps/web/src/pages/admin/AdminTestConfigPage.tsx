import { Link } from 'react-router-dom';
import { FilePlus2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { useAllTestConfigs, useToggleTestConfigActive } from '../../features/test-config/hooks/useTestConfigs';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

export default function AdminTestConfigPage() {
  const configsQuery = useAllTestConfigs();
  const toggleActive = useToggleTestConfigActive();

  const configs = configsQuery.data ?? [];

  const handleToggle = (id: string, currentActive: boolean) => {
    toggleActive.mutate(
      { id, active: !currentActive },
      {
        onSuccess: () => {
          toast.success(`Config ${currentActive ? 'deactivated' : 'activated'}.`);
        },
        onError: () => {
          toast.error('Failed to update config. Try again.');
        },
      },
    );
  };

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">
              Admin Console
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Test configurations</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
              Create and manage aptitude test configurations. Active configs are visible to students.
            </p>
          </div>
          <Link to="/admin/test-configs/new">
            <Button className="inline-flex items-center gap-2">
              <FilePlus2 aria-hidden="true" className="h-4 w-4" />
              New config
            </Button>
          </Link>
        </section>

        {configsQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((n) => (
              <ThemeAwareSkeleton key={n} className="h-20 w-full" />
            ))}
          </div>
        ) : configsQuery.isError ? (
          <Card className="text-sm text-red-700 dark:text-red-300">
            Failed to load test configurations. Check Firestore rules and your admin access.
          </Card>
        ) : configs.length === 0 ? (
          <Card className="py-12 text-center text-muted">
            No test configurations yet.{' '}
            <Link className="text-brand-600 underline" to="/admin/test-configs/new">
              Create the first one.
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surfaceSoft">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Domain</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Questions</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Duration</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Marks/Q</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {configs.map((config) => (
                  <tr key={config.id} className="transition hover:bg-surfaceSoft">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{config.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{config.description}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{config.domainId}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{config.totalQuestions}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatDuration(config.duration)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{config.marksPerQuestion}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        aria-label={config.active ? 'Deactivate' : 'Activate'}
                        className="inline-flex items-center justify-center rounded p-1 transition hover:bg-surfaceSoft"
                        disabled={toggleActive.isPending}
                        onClick={() => handleToggle(config.id, config.active)}
                        type="button"
                      >
                        {config.active ? (
                          <ToggleRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
