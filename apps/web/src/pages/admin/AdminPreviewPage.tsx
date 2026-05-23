import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { QuestionCard } from '../../features/test-taking/components/QuestionCard';
import { QuestionNavigator } from '../../features/test-taking/components/QuestionNavigator';
import { cn } from '../../lib/utils/cn';
import type { SnapshotQuestion } from '../../features/test-taking/types';

interface PreviewConfig {
  id: string;
  name: string;
  marksPerQuestion: number;
  negativeMarksRatio: number;
  totalQuestions: number;
}

interface PreviewData {
  config: PreviewConfig;
  questions: SnapshotQuestion[];
}

interface ScoreResult {
  questionId: string;
  userAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
  marks: number;
}

interface ScoreResponse {
  scoredMarks: number;
  totalMarks: number;
  percentageScore: number;
  accuracy: number;
  results: ScoreResult[];
}

export default function AdminPreviewPage() {
  const { configId } = useParams<{ configId: string }>();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scoreResponse, setScoreResponse] = useState<ScoreResponse | null>(null);

  const previewQuery = useQuery({
    queryKey: ['admin-preview', configId],
    queryFn: async (): Promise<PreviewData> => {
      const res = await apiClient.get<PreviewData>(`/test-configs/${configId}/preview`);
      return res.data;
    },
    enabled: Boolean(configId),
  });

  const scoreMutation = useMutation({
    mutationFn: async (): Promise<ScoreResponse> => {
      const { config, questions } = previewQuery.data!;
      const res = await apiClient.post<ScoreResponse>(`/test-configs/${configId}/preview/score`, {
        questionIds: questions.map((q) => q.id),
        answers,
        marksPerQuestion: config.marksPerQuestion,
        negativeMarksRatio: config.negativeMarksRatio,
      });
      return res.data;
    },
    onSuccess: (data) => setScoreResponse(data),
  });

  if (previewQuery.isLoading) {
    return (
      <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <ThemeAwareSkeleton className="h-[600px] w-full" />
        </div>
      </main>
    );
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <Card className="p-6 text-sm text-red-700 dark:text-red-300">
            Failed to load test preview. The configuration may not exist.
          </Card>
        </div>
      </main>
    );
  }

  const { config, questions } = previewQuery.data;
  const question = questions[currentIndex];
  if (!question) return null;

  if (scoreResponse) {
    return (
      <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/test-configs"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to configs
            </Link>
          </div>

          <section>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Preview result</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{config.name}</h1>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex flex-col items-center p-5">
              <p className="font-numeric text-3xl font-semibold">
                {scoreResponse.scoredMarks}/{scoreResponse.totalMarks}
              </p>
              <p className="mt-1 text-sm text-muted">Score</p>
            </Card>
            <Card className="flex flex-col items-center p-5">
              <p className="font-numeric text-3xl font-semibold">
                {Math.round(scoreResponse.percentageScore)}%
              </p>
              <p className="mt-1 text-sm text-muted">Percentage</p>
            </Card>
            <Card className="flex flex-col items-center p-5">
              <p className="font-numeric text-3xl font-semibold">
                {Math.round(scoreResponse.accuracy)}%
              </p>
              <p className="mt-1 text-sm text-muted">Accuracy</p>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            {questions.map((q, idx) => {
              const r = scoreResponse.results.find((res) => res.questionId === q.id);
              const answered = Boolean(r?.userAnswer);
              return (
                <Card key={q.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {!answered ? (
                        <MinusCircle className="h-5 w-5 text-muted" />
                      ) : r?.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted">Q{idx + 1}</p>
                      <p className="mt-1 text-sm leading-6 text-foreground">{q.text}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs">
                        <span>
                          Your answer:{' '}
                          <span
                            className={cn(
                              'font-semibold',
                              !answered
                                ? 'text-muted'
                                : r?.isCorrect
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400',
                            )}
                          >
                            {r?.userAnswer ?? '—'}
                          </span>
                        </span>
                        <span>
                          Correct:{' '}
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {r?.correctAnswer ?? '—'}
                          </span>
                        </span>
                        {r?.marks !== 0 && (
                          <span
                            className={cn(
                              'font-semibold',
                              (r?.marks ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                            )}
                          >
                            {(r?.marks ?? 0) > 0 ? '+' : ''}{r?.marks} marks
                          </span>
                        )}
                      </div>
                      {r?.explanation && (
                        <p className="mt-2 text-xs text-muted">{r.explanation}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            onClick={() => {
              setScoreResponse(null);
              setAnswers({});
              setMarkedForReview({});
              setCurrentIndex(0);
            }}
            variant="secondary"
            type="button"
          >
            Retake Preview
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            to="/admin/test-configs"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to configs
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              Preview mode — results not saved
            </span>
            <Button
              disabled={scoreMutation.isPending}
              onClick={() => scoreMutation.mutate()}
              type="button"
            >
              {scoreMutation.isPending ? 'Scoring…' : 'Submit & See Results'}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Admin Preview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{config.name}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <Card className="p-6">
            <QuestionCard
              question={question}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              answer={answers[question.id] ?? ''}
              isMarked={Boolean(markedForReview[question.id])}
              onAnswer={(ans) => setAnswers((prev) => ({ ...prev, [question.id]: ans }))}
              onClear={() => setAnswers((prev) => { const n = { ...prev }; delete n[question.id]; return n; })}
              onToggleMark={() =>
                setMarkedForReview((prev) => ({ ...prev, [question.id]: !prev[question.id] }))
              }
              onNext={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
              onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            />
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-4">
              <QuestionNavigator
                questions={questions}
                answers={answers}
                markedForReview={markedForReview}
                currentIndex={currentIndex}
                onNavigate={setCurrentIndex}
              />
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
