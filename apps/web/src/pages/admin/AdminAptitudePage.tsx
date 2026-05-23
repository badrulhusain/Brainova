import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { AptitudeResultCard } from '../../features/aptitude/components/AptitudeResultCard';
import { AptitudeTestShell } from '../../features/aptitude/components/AptitudeTestShell';
import type { AptitudeQuestion, AptitudeResult, AptitudeScores, AptitudeCategory } from '../../features/aptitude/types';
import { useQuery, useMutation } from '@tanstack/react-query';

type AdminAptitudePreviewResult = { scores: AptitudeScores; strongestCategory: AptitudeCategory };

type Mode = 'intro' | 'test' | 'result';

export default function AdminAptitudePage() {
  const [mode, setMode] = useState<Mode>('intro');
  const [previewResult, setPreviewResult] = useState<AdminAptitudePreviewResult | null>(null);

  const questionsQuery = useQuery({
    queryKey: ['admin-aptitude-questions'],
    queryFn: async (): Promise<AptitudeQuestion[]> => {
      const res = await apiClient.get<AptitudeQuestion[]>('/aptitude/admin/questions');
      return res.data;
    },
    enabled: false,
  });

  const scoreMutation = useMutation({
    mutationFn: async (answers: Record<string, string>): Promise<AdminAptitudePreviewResult> => {
      const res = await apiClient.post<AdminAptitudePreviewResult>('/aptitude/admin/score', { answers });
      return res.data;
    },
    onSuccess: (data) => {
      setPreviewResult(data);
      setMode('result');
    },
    onError: () => {
      toast.error('Failed to score aptitude preview. Please try again.');
    },
  });

  const startAssessment = () => {
    setPreviewResult(null);
    setMode('test');
    void questionsQuery.refetch();
  };

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Admin Preview</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Aptitude Assessment</h1>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            Preview mode — results not saved
          </span>
        </div>

        {mode === 'intro' && (
          <Card className="mx-auto max-w-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Discover Your Aptitude</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Take the same 30-question assessment students receive across ten career categories.
              Your result highlights the track that best matches your aptitude.
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
            onSubmit={(answers) => scoreMutation.mutate(answers)}
            isSubmitting={scoreMutation.isPending}
          />
        )}

        {mode === 'result' && previewResult && (
          <div className="flex flex-col gap-6">
            <AptitudeResultCard result={previewResult as AptitudeResult} />
            <div className="flex justify-center">
              <Button onClick={startAssessment} type="button" variant="secondary">
                Take Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
