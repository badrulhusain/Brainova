import { Link } from 'react-router-dom';
import { Database, FilePlus2, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/card';
import { useAdminTaxonomy } from '../features/admin/hooks/useAdminTaxonomy';

const actionLinkClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export default function AdminPage() {
  const taxonomyQuery = useAdminTaxonomy();
  const domains = taxonomyQuery.data ?? [];
  const topicCount = domains.reduce((count, domain) => count + domain.topics.length, 0);
  const subtopicCount = domains.reduce(
    (count, domain) => count + domain.topics.reduce((topicTotal, topic) => topicTotal + topic.subtopics.length, 0),
    0,
  );

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Admin Console</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Question bank management</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
              Add secure public questions while storing correct answers and explanations in private answer keys.
            </p>
          </div>
          <Link className={actionLinkClass} to="/admin/questions/new">
            <FilePlus2 aria-hidden="true" className="h-4 w-4" />
            Add question
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
              <Database aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="font-numeric text-2xl font-semibold">{taxonomyQuery.isLoading ? '--' : domains.length}</p>
              <p className="text-sm text-muted">Domains</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="font-numeric text-2xl font-semibold">{taxonomyQuery.isLoading ? '--' : topicCount}</p>
              <p className="text-sm text-muted">Topics</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
              <FilePlus2 aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="font-numeric text-2xl font-semibold">{taxonomyQuery.isLoading ? '--' : subtopicCount}</p>
              <p className="text-sm text-muted">Subtopics</p>
            </div>
          </Card>
        </section>

        {taxonomyQuery.isError ? (
          <Card className="p-5 text-sm text-red-700 dark:text-red-300">
            Unable to load admin taxonomy. Confirm your account has admin access and Firestore rules are deployed.
          </Card>
        ) : null}

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Available actions</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link
              className="rounded-lg border border-border bg-background px-4 py-4 text-sm font-semibold transition hover:bg-surfaceSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              to="/admin/questions/new"
            >
              Create a question and private answer key
            </Link>
            <Link
              className="rounded-lg border border-border bg-background px-4 py-4 text-sm font-semibold transition hover:bg-surfaceSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              to="/admin/test-configs"
            >
              Manage test configurations
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
