import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { DifficultyBreakdownChart } from '../../features/results/components/DifficultyBreakdownChart';
import { QuestionReviewList } from '../../features/results/components/QuestionReviewList';
import { ScoreCard } from '../../features/results/components/ScoreCard';
import { TopicBreakdownChart } from '../../features/results/components/TopicBreakdownChart';
import { useAdminTestResult } from '../../features/admin/hooks/useAdminResults';

export default function AdminResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const id = resultId ?? '';
  const { data: result, isLoading, error } = useAdminTestResult(id);

  if (isLoading) {
    return (
      <main className="bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <ThemeAwareSkeleton className="h-52 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <ThemeAwareSkeleton className="h-64 w-full" />
            <ThemeAwareSkeleton className="h-64 w-full" />
          </div>
          <ThemeAwareSkeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <Card className="p-8 text-center text-sm text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : 'Result not found.'}
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10 print:p-4">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 print:hidden">
          <Link
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
            to="/admin/results"
          >
            <ArrowLeft className="h-4 w-4" />
            Student results
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-semibold tracking-tight print:mb-4">
          Student test result
        </h1>

        <div className="flex flex-col gap-6">
          <ScoreCard result={result} />

          <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
            <TopicBreakdownChart breakdown={result.topicBreakdown} />
            <DifficultyBreakdownChart breakdown={result.difficultyBreakdown} />
          </div>

          <QuestionReviewList
            questionResults={result.questionResults}
            markedForReview={{}}
          />
        </div>
      </div>
    </main>
  );
}
