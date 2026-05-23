import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ThemeAwareSkeleton } from '../components/ui/theme-toggle';
import { AptitudeResultCard } from '../features/aptitude/components/AptitudeResultCard';
import { AptitudeTestShell } from '../features/aptitude/components/AptitudeTestShell';
import { useAptitudeQuestions } from '../features/aptitude/hooks/useAptitudeQuestions';
import { useLatestAptitudeResult } from '../features/aptitude/hooks/useLatestAptitudeResult';
import { useSubmitAptitude } from '../features/aptitude/hooks/useSubmitAptitude';
import type { AptitudeResult } from '../features/aptitude/types';

type AptitudeMode = 'intro' | 'test' | 'result';

export default function AptitudePage() {
  const [mode, setMode] = useState<AptitudeMode>('intro');
  const [localResult, setLocalResult] = useState<AptitudeResult | null>(null);
  const latestResultQuery = useLatestAptitudeResult();
  const questionsQuery = useAptitudeQuestions();
  const submitMutation = useSubmitAptitude();

  useEffect(() => {
    if (mode === 'intro' && latestResultQuery.data) {
      setLocalResult(latestResultQuery.data);
      setMode('result');
    }
  }, [latestResultQuery.data, mode]);

  const startAssessment = () => {
    setLocalResult(null);
    setMode('test');
    void questionsQuery.refetch();
  };

  const submitAssessment = async (answers: Record<string, string>) => {
    try {
      const result = await submitMutation.mutateAsync(answers);
      setLocalResult(result);
      setMode('result');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit aptitude assessment.');
    }
  };

  const result = localResult ?? latestResultQuery.data ?? null;

  if (latestResultQuery.isLoading && mode === 'intro') {
    return (
      <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <ThemeAwareSkeleton className="h-80 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-4xl">
        {mode === 'intro' && (
          <Card className="mx-auto max-w-2xl p-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Discover Your Aptitude</h1>
            <p className="mt-4 text-base leading-7 text-muted">
              Take one focused 30-question assessment across ten master career categories. Your
              result highlights the track that best matches your aptitude, interests, and working
              style.
            </p>
            <Button className="mt-6" onClick={startAssessment} type="button">
              Start Assessment
            </Button>
          </Card>
        )}

        {mode === 'test' && questionsQuery.isFetching && (
          <div className="mx-auto max-w-2xl">
            <ThemeAwareSkeleton className="h-[520px] w-full" />
          </div>
        )}

        {mode === 'test' && !questionsQuery.isFetching && (
          <AptitudeTestShell
            questions={questionsQuery.data ?? []}
            onSubmit={(answers) => void submitAssessment(answers)}
            isSubmitting={submitMutation.isPending}
          />
        )}

        {mode === 'result' && result && (
          <AptitudeResultCard result={result} />
        )}
      </div>
    </main>
  );
}
