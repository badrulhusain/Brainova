import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpenCheck,
  Brain,
  Calculator,
  Clock3,
  FileText,
  GitBranch,
  Percent,
  Scale,
  Sigma,
  SpellCheck,
  Timer,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useQuestionCountsByDomain } from '../features/test-taking/hooks/useQuestionCountsByDomain';
import { useDomains } from '../features/test-taking/hooks/useDomains';
import { useQuestionsByDomain } from '../features/test-taking/hooks/useQuestionsByDomain';
import { appCopy } from '../lib/constants/copy';
import { cn } from '../lib/utils/cn';

type UpcomingKey = keyof typeof appCopy.upcoming;

interface UpcomingPageProps {
  page: UpcomingKey;
}

const topicIcons = {
  percentages: Percent,
  'ratio-proportion': Scale,
  'profit-loss': Sigma,
  'time-work': Timer,
  series: GitBranch,
  analogies: Brain,
  'coding-decoding': SpellCheck,
  syllogisms: GitBranch,
  'synonyms-antonyms': BookOpenCheck,
  'sentence-correction': SpellCheck,
  'reading-comprehension': FileText,
  'fill-blanks': FileText,
} as const;

const fallbackTopicIcons = [Calculator, Brain, BookOpenCheck, FileText] as const;

function getReadableError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Check that Firestore rules and indexes are deployed, and that the seed data exists.';
}

function AptitudeQuestionBankPage() {
  const copy = appCopy.testsPreview;
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const domainsQuery = useDomains();
  const questionCountsQuery = useQuestionCountsByDomain();
  const activeDomains = domainsQuery.data ?? [];
  const previewDomain = activeDomains.find((domain) => domain.id === selectedDomainId) ?? activeDomains[0] ?? null;
  const questionsQuery = useQuestionsByDomain(previewDomain?.id ?? null);
  const isLoading =
    domainsQuery.isLoading || questionCountsQuery.isLoading || (Boolean(previewDomain) && questionsQuery.isLoading);
  const error = domainsQuery.error ?? questionCountsQuery.error ?? questionsQuery.error;
  const questions = questionsQuery.data ?? [];
  const questionCounts = questionCountsQuery.data ?? {};
  const totalQuestionCount = Object.values(questionCounts).reduce((total, count) => total + count, 0);
  const topicNames = Array.from(new Set(questions.map((question) => question.topic)));

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{copy.subtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
                <BookOpenCheck aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-numeric">{isLoading ? '--' : totalQuestionCount}</p>
                <p className="text-sm text-muted">{copy.questionsLabel}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                <Brain aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-numeric">{isLoading ? '--' : activeDomains.length}</p>
                <p className="text-sm text-muted">{copy.domainsLabel}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
                <Clock3 aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-numeric">{copy.attemptValue}</p>
                <p className="text-sm text-muted">{copy.attemptLabel}</p>
              </div>
            </Card>
          </div>
        </section>

        {isLoading ? (
          <Card className="p-6 text-sm text-muted">{copy.loading}</Card>
        ) : error ? (
          <Card className="flex items-start gap-3 p-6 text-sm text-red-700 dark:text-red-300">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              <span className="block font-semibold">{copy.errorTitle}</span>
              <span className="mt-1 block text-red-600 dark:text-red-200">{getReadableError(error)}</span>
            </span>
          </Card>
        ) : activeDomains.length === 0 || !previewDomain ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold">{copy.emptyTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{copy.emptyBody}</p>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label={copy.domainsAriaLabel}>
              {activeDomains.map((domain, index) => {
                const Icon = fallbackTopicIcons[index % fallbackTopicIcons.length] ?? Calculator;
                const domainQuestionCount = questionCounts[domain.id] ?? 0;
                const isSelected = previewDomain.id === domain.id;

                return (
                  <button
                    key={domain.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDomainId(domain.id)}
                    className={cn(
                      'rounded-lg border border-border bg-surface p-5 text-left shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                      isSelected ? 'border-brand-500 ring-2 ring-brand-100 dark:ring-brand-900/70' : '',
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">{domain.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {domainQuestionCount} active {copy.questionsLabel.toLowerCase()}
                    </p>
                  </button>
                );
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
                    <Calculator aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">
                      {copy.relatedEyebrow}
                    </p>
                    <h2 className="text-xl font-semibold">{copy.relatedTitle}</h2>
                  </div>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
                  {copy.studyFocus.map((item) => (
                    <li key={item} className="rounded-lg border border-border bg-background px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              <section className="grid gap-4" aria-label={copy.questionBankLabel}>
                <Card className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Preview domain</p>
                      <h2 className="mt-1 text-xl font-semibold">{previewDomain.name}</h2>
                    </div>
                    <p className="text-sm text-muted">{questions.length} public questions loaded</p>
                  </div>
                </Card>

                {questions.length === 0 ? (
                  <Card className="p-5">
                    <h3 className="text-base font-semibold">{copy.emptyTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{copy.emptyBody}</p>
                  </Card>
                ) : null}

                {topicNames.map((topic, index) => {
                  const Icon = topicIcons[topic as keyof typeof topicIcons] ?? fallbackTopicIcons[index % fallbackTopicIcons.length] ?? Calculator;
                  const topicQuestionCount = questions.filter((question) => question.topic === topic).length;

                  return (
                    <Card key={topic} className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold capitalize">{topic.replace('-', ' ')}</h3>
                          <p className="text-sm text-muted">
                            {topicQuestionCount} {copy.questionsLabel.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {questions.map((item, index) => (
                  <Card key={item.id} className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase">
                        <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200">
                          {item.topic}
                        </span>
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                          {item.difficulty}
                        </span>
                      </div>
                      <span className="font-numeric text-sm font-semibold text-muted">
                        {copy.questionPrefix}
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold leading-7 text-foreground">{item.text}</h3>
                    <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                      {item.options.map((option) => (
                        <li
                          key={option}
                          className="rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground"
                        >
                          {option}
                        </li>
                      ))}
                    </ol>
                  </Card>
                ))}
              </section>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default function UpcomingPage({ page }: UpcomingPageProps) {
  const copy = appCopy.upcoming[page];

  if (page === 'tests') {
    return <AptitudeQuestionBankPage />;
  }

  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <Card className="p-8">
          <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Milestone roadmap</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted">{copy.body}</p>
          <Link to="/">
            <Button className="mt-6">{appCopy.notFound.action}</Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
