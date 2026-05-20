import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { testConfigSchema, type TestConfigInput } from '../../lib/validators/testConfig';
import { useCreateTestConfig } from '../../features/test-config/hooks/useTestConfigs';
import { useDomains } from '../../features/test-taking/hooks/useDomains';

const TOTAL_QUESTION_OPTIONS = [10, 15, 20, 25, 30] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{message}</p>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export default function AdminTestConfigNewPage() {
  const navigate = useNavigate();
  const createConfig = useCreateTestConfig();
  const domainsQuery = useDomains();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TestConfigInput>({
    resolver: zodResolver(testConfigSchema),
    defaultValues: {
      marksPerQuestion: 1,
      negativeMarksRatio: 0,
      totalQuestions: 10,
      duration: 20,
      shuffleQuestions: true,
      shuffleOptions: false,
      active: true,
      topicFilter: [],
      difficultyDistribution: { easy: 4, medium: 3, hard: 3 },
    },
  });

  const totalQuestions = watch('totalQuestions');

  const onSubmit = (data: TestConfigInput) => {
    createConfig.mutate(data, {
      onSuccess: () => {
        toast.success('Test configuration created.');
        navigate('/admin/test-configs');
      },
      onError: () => {
        toast.error('Failed to create configuration. Try again.');
      },
    });
  };

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <button
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
          onClick={() => navigate('/admin/test-configs')}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to configurations
        </button>

        <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">
          Admin Console
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">New test configuration</h1>

        <form className="mt-8" onSubmit={handleSubmit(onSubmit)}>
          <Card className="flex flex-col gap-6 p-6">
            {/* Basic info */}
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="name">Configuration name</Label>
                <Input
                  className="mt-1"
                  id="name"
                  placeholder="e.g. Quantitative Aptitude — 30 min"
                  {...register('name')}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                  id="description"
                  placeholder="What this test covers..."
                  rows={2}
                  {...register('description')}
                />
                <FieldError message={errors.description?.message} />
              </div>

              <div>
                <Label htmlFor="domainId">Domain</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  id="domainId"
                  {...register('domainId')}
                >
                  <option value="">Select a domain…</option>
                  {(domainsQuery.data ?? []).map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.domainId?.message} />
              </div>
            </div>

            <hr className="border-border" />

            {/* Question settings */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">Question settings</h2>

              <div>
                <Label htmlFor="totalQuestions">Total questions</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  id="totalQuestions"
                  {...register('totalQuestions', { valueAsNumber: true })}
                >
                  {TOTAL_QUESTION_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.totalQuestions?.message} />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  className="mt-1"
                  id="duration"
                  min={5}
                  max={180}
                  type="number"
                  {...register('duration', {
                    setValueAs: (v: string) => Number(v) * 60,
                  })}
                />
                <FieldError message={errors.duration?.message} />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">
                  Difficulty distribution{' '}
                  <span className="text-muted">(must sum to {totalQuestions})</span>
                </p>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <div key={level}>
                      <label
                        className="block text-xs font-medium capitalize text-muted"
                        htmlFor={`dd-${level}`}
                      >
                        {level}
                      </label>
                      <Input
                        className="mt-1"
                        id={`dd-${level}`}
                        min={0}
                        type="number"
                        {...register(`difficultyDistribution.${level}`, { valueAsNumber: true })}
                      />
                    </div>
                  ))}
                </div>
                <FieldError message={errors.difficultyDistribution?.message} />
              </div>
            </div>

            <hr className="border-border" />

            {/* Scoring */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">Scoring</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marksPerQuestion">Marks per question</Label>
                  <Input
                    className="mt-1"
                    id="marksPerQuestion"
                    min={0.25}
                    step={0.25}
                    type="number"
                    {...register('marksPerQuestion', { valueAsNumber: true })}
                  />
                  <FieldError message={errors.marksPerQuestion?.message} />
                </div>
                <div>
                  <Label htmlFor="negativeMarksRatio">Negative marks ratio</Label>
                  <Input
                    className="mt-1"
                    id="negativeMarksRatio"
                    max={1}
                    min={0}
                    step={0.25}
                    type="number"
                    {...register('negativeMarksRatio', { valueAsNumber: true })}
                  />
                  <p className="mt-1 text-xs text-muted">0 = none, 0.25 = quarter mark</p>
                  <FieldError message={errors.negativeMarksRatio?.message} />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Options */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-semibold">Options</h2>

              {(
                [
                  { id: 'shuffleQuestions', label: 'Shuffle question order' },
                  { id: 'shuffleOptions', label: 'Shuffle answer options' },
                  { id: 'active', label: 'Active (visible to students)' },
                ] as const
              ).map(({ id, label }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-3 text-sm"
                  htmlFor={id}
                >
                  <input
                    className="h-4 w-4 rounded border-border text-brand-600"
                    id={id}
                    type="checkbox"
                    {...register(id)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/test-configs')}
              >
                Cancel
              </Button>
              <Button disabled={createConfig.isPending} type="submit">
                {createConfig.isPending ? 'Creating…' : 'Create configuration'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </main>
  );
}
