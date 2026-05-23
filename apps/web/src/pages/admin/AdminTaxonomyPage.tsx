import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { useAdminTaxonomy } from '../../features/admin/hooks/useAdminTaxonomy';
import {
  useCreateDomain,
  useCreateTopic,
  useCreateSubtopic,
} from '../../features/admin/hooks/useTaxonomyMutations';
import type { AdminDomain, AdminTopic } from '../../features/admin/types';

// ── Inline mini-form ──────────────────────────────────────────────────────────
function InlineForm({
  label,
  onSave,
  onCancel,
}: {
  label: string;
  onSave: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = handleSubmit(async ({ name, description }) => {
    await onSave(name, description);
    reset();
  });

  return (
    <form className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-surfaceSoft p-3" onSubmit={onSubmit}>
      <input
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder={`${label} name`}
        {...register('name', { required: true })}
      />
      <input
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="Short description"
        {...register('description', { required: true })}
      />
      <div className="flex gap-2">
        <Button className="h-7 px-3 text-xs" disabled={formState.isSubmitting} type="submit">
          {formState.isSubmitting ? 'Saving…' : 'Save'}
        </Button>
        <button
          className="text-xs text-muted hover:text-foreground"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Subtopic list ─────────────────────────────────────────────────────────────
function SubtopicList({
  subtopics,
  domainId,
  topicId,
}: {
  subtopics: { id: string; name: string }[];
  domainId: string;
  topicId: string;
}) {
  const [adding, setAdding] = useState(false);
  const createSubtopic = useCreateSubtopic();

  return (
    <div className="ml-8 mt-1 flex flex-col gap-1">
      {subtopics.map((s) => (
        <p key={s.id} className="text-xs text-muted">• {s.name}</p>
      ))}
      {adding ? (
        <InlineForm
          label="Subtopic"
          onSave={async (name, description) => {
            await createSubtopic.mutateAsync({ domainId, topicId, name, description, order: subtopics.length });
            toast.success('Subtopic created');
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
          onClick={() => setAdding(true)}
          type="button"
        >
          <Plus className="h-3 w-3" /> Add subtopic
        </button>
      )}
    </div>
  );
}

// ── Topic list ────────────────────────────────────────────────────────────────
function TopicList({
  topics,
  domainId,
}: {
  topics: AdminTopic[];
  domainId: string;
}) {
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const createTopic = useCreateTopic();

  return (
    <div className="ml-4 mt-2 flex flex-col gap-2">
      {topics.map((t) => (
        <div key={t.id}>
          <button
            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-brand-600"
            onClick={() => setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))}
            type="button"
          >
            {expanded[t.id] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {t.name}
            <span className="ml-1 text-xs text-muted">({t.subtopics.length} subtopics)</span>
          </button>
          {expanded[t.id] && (
            <SubtopicList subtopics={t.subtopics} domainId={domainId} topicId={t.id} />
          )}
        </div>
      ))}
      {adding ? (
        <InlineForm
          label="Topic"
          onSave={async (name, description) => {
            await createTopic.mutateAsync({ domainId, name, description, order: topics.length });
            toast.success('Topic created');
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
          onClick={() => setAdding(true)}
          type="button"
        >
          <Plus className="h-3 w-3" /> Add topic
        </button>
      )}
    </div>
  );
}

// ── Domain card ───────────────────────────────────────────────────────────────
function DomainCard({ domain }: { domain: AdminDomain }) {
  const [expanded, setExpanded] = useState(false);
  const topicCount = domain.topics.length;
  const subtopicCount = domain.topics.reduce((n, t) => n + t.subtopics.length, 0);

  return (
    <Card className="p-5">
      <button
        className="flex w-full items-center justify-between gap-3"
        onClick={() => setExpanded((e) => !e)}
        type="button"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-muted" /> : <ChevronRight className="h-4 w-4 text-muted" />}
          <span className="font-semibold text-foreground">{domain.name}</span>
          <span className="text-xs text-muted">{topicCount} topics · {subtopicCount} subtopics</span>
        </div>
      </button>
      {expanded && (
        <TopicList topics={domain.topics} domainId={domain.id} />
      )}
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminTaxonomyPage() {
  const taxonomyQuery = useAdminTaxonomy();
  const [addingDomain, setAddingDomain] = useState(false);
  const createDomain = useCreateDomain();
  const domains = taxonomyQuery.data ?? [];

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div>
          <Link
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            to="/admin"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to admin console
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Domains & Topics</h1>
          <p className="mt-2 text-sm text-muted">
            Manage the taxonomy structure used to organise questions and test configurations.
          </p>
        </div>

        {/* Add domain */}
        {addingDomain ? (
          <Card className="p-5">
            <p className="mb-3 text-sm font-semibold">New domain</p>
            <InlineForm
              label="Domain"
              onSave={async (name, description) => {
                await createDomain.mutateAsync({ name, description, icon: 'book', order: domains.length });
                toast.success(`Domain "${name}" created`);
                setAddingDomain(false);
              }}
              onCancel={() => setAddingDomain(false)}
            />
          </Card>
        ) : (
          <div>
            <Button className="gap-2" onClick={() => setAddingDomain(true)} type="button">
              <Plus className="h-4 w-4" />
              Add domain
            </Button>
          </div>
        )}

        {/* Domain list */}
        {taxonomyQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((n) => <ThemeAwareSkeleton key={n} className="h-16 w-full" />)}
          </div>
        ) : taxonomyQuery.isError ? (
          <Card className="p-5 text-sm text-red-700 dark:text-red-300">Failed to load taxonomy.</Card>
        ) : domains.length === 0 ? (
          <Card className="py-10 text-center text-sm text-muted">
            No domains yet. Add one above or run <code className="rounded bg-surfaceSoft px-1">npm run seed</code>.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {domains.map((d) => <DomainCard key={d.id} domain={d} />)}
          </div>
        )}
      </div>
    </main>
  );
}
