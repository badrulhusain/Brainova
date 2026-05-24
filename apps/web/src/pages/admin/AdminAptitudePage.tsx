import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { AptitudeResultCard } from '../../features/aptitude/components/AptitudeResultCard';
import { AptitudeTestShell } from '../../features/aptitude/components/AptitudeTestShell';
import { APTITUDE_LABELS } from '../../features/aptitude/types';
import type { AptitudeQuestion, AptitudeResult, AptitudeScores, AptitudeCategory } from '../../features/aptitude/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '../../lib/utils/cn';

type AdminAptitudePreviewResult = { scores: AptitudeScores; strongestCategory: AptitudeCategory };
type PreviewMode = 'intro' | 'test' | 'result';
type Tab = 'questions' | 'preview';

interface AdminAptitudeQuestion extends AptitudeQuestion {
  correctAnswer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
};

export default function AdminAptitudePage() {
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('intro');
  const [previewResult, setPreviewResult] = useState<AdminAptitudePreviewResult | null>(null);

  const allQuestionsQuery = useQuery({
    queryKey: ['admin-aptitude-all-questions'],
    queryFn: async (): Promise<AdminAptitudeQuestion[]> => {
      const res = await apiClient.get<AdminAptitudeQuestion[]>('/aptitude/admin/all-questions');
      return res.data;
    },
  });

  const previewQuestionsQuery = useQuery({
    queryKey: ['admin-aptitude-preview-questions'],
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
      setPreviewMode('result');
    },
    onError: () => {
      toast.error('Failed to score aptitude preview. Please try again.');
    },
  });

  const startPreview = () => {
    setPreviewResult(null);
    setPreviewMode('test');
    void previewQuestionsQuery.refetch();
  };

  const questions = allQuestionsQuery.data ?? [];
  const byCategory = questions.reduce<Record<string, AdminAptitudeQuestion[]>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    (acc[q.category] as AdminAptitudeQuestion[]).push(q);
    return acc;
  }, {});

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Admin Console</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Aptitude Assessment</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-border bg-surfaceSoft p-1 w-fit">
          <button
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-semibold transition',
              activeTab === 'questions'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted hover:text-foreground',
            )}
            onClick={() => setActiveTab('questions')}
            type="button"
          >
            All Questions
          </button>
          <button
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-semibold transition',
              activeTab === 'preview'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted hover:text-foreground',
            )}
            onClick={() => setActiveTab('preview')}
            type="button"
          >
            Preview Assessment
          </button>
        </div>

        {/* Questions tab */}
        {activeTab === 'questions' && (
          <div className="flex flex-col gap-4">
            {allQuestionsQuery.isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <ThemeAwareSkeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : allQuestionsQuery.isError ? (
              <Card className="p-6 text-sm text-red-700 dark:text-red-300">
                Failed to load questions. Check your admin access and API connection.
              </Card>
            ) : questions.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted">
                No aptitude questions found. Run the seed script to populate questions.
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">
                    {questions.length} active questions across {Object.keys(byCategory).length} categories
                  </p>
                </div>
                {Object.entries(byCategory).map(([category, qs]) => (
                  <Card key={category} className="p-5">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                      {APTITUDE_LABELS[category as AptitudeCategory] ?? category}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {qs.map((q, idx) => (
                        <div key={q.id} className="rounded-lg border border-border p-4">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                              {idx + 1}. {q.text}
                            </p>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                                DIFFICULTY_BADGE[q.difficulty] ?? '',
                              )}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {q.options.map((opt) => (
                              <div
                                key={opt}
                                className={cn(
                                  'rounded-md px-3 py-1.5 text-sm',
                                  opt === q.correctAnswer
                                    ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-surfaceSoft text-muted',
                                )}
                              >
                                {opt === q.correctAnswer && '✓ '}
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Preview tab */}
        {activeTab === 'preview' && (
          <div>
            <div className="mb-4 flex justify-end">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Preview mode — results not saved
              </span>
            </div>

            {previewMode === 'intro' && (
              <Card className="mx-auto max-w-2xl p-8 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Discover Your Aptitude</h2>
                <p className="mt-4 text-base leading-7 text-muted">
                  Take the same 30-question assessment students receive across ten academic categories.
                </p>
                <Button className="mt-6" onClick={startPreview} type="button">
                  Start Assessment
                </Button>
              </Card>
            )}

            {previewMode === 'test' && previewQuestionsQuery.isFetching && (
              <div className="mx-auto max-w-2xl">
                <ThemeAwareSkeleton className="h-[520px] w-full" />
              </div>
            )}

            {previewMode === 'test' && !previewQuestionsQuery.isFetching && (
              <AptitudeTestShell
                questions={previewQuestionsQuery.data ?? []}
                onSubmit={(answers) => scoreMutation.mutate(answers)}
                isSubmitting={scoreMutation.isPending}
              />
            )}

            {previewMode === 'result' && previewResult && (
              <div className="flex flex-col gap-6">
                <AptitudeResultCard result={previewResult as AptitudeResult} />
                <div className="flex justify-center">
                  <Button onClick={startPreview} type="button" variant="secondary">
                    Take Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
