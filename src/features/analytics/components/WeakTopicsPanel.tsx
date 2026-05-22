import { AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { ThemeAwareSkeleton } from '../../../components/ui/theme-toggle';
import { useWeakTopics } from '../hooks/useWeakTopics';

interface WeakTopicsPanelProps {
  uid: string;
}

export function WeakTopicsPanel({ uid }: WeakTopicsPanelProps) {
  const { data: weakTopics, isLoading, error } = useWeakTopics(uid);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <h2 className="text-base font-semibold">Weak topics</h2>
      </div>
      <p className="mt-1 text-xs text-muted">Topics with the lowest accuracy across recent attempts.</p>

      {isLoading ? (
        <div className="mt-4 flex flex-col gap-2">
          {[1, 2, 3].map((n) => (
            <ThemeAwareSkeleton key={n} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700 dark:text-red-300">Failed to load weak topics.</p>
      ) : !weakTopics || weakTopics.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Complete some tests to see weak topics.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {weakTopics.map((topic) => (
            <div
              key={topic.topicId}
              className="flex items-center justify-between rounded-lg border border-border bg-surfaceSoft px-4 py-3"
            >
              <span className="text-sm font-medium text-foreground">{topic.topicId}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">
                  {topic.correct}/{topic.attempted} correct
                </span>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  {Math.round(topic.accuracy * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
