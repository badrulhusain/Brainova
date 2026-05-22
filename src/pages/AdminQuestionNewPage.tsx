import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAdminTaxonomy } from '../features/admin/hooks/useAdminTaxonomy';
import {
  createAdminQuestion,
  createAdminSubtopic,
  createAdminTopic,
} from '../features/admin/services/questionAdminService';
import { useAuth } from '../features/auth/AuthProvider';
import { adminQuestionSchema, type AdminQuestionInput } from '../lib/validators/adminQuestion';

type QuestionFormType = AdminQuestionInput['type'];
type QuestionDifficulty = AdminQuestionInput['difficulty'];

interface FormState {
  domain: string;
  topic: string;
  subtopic: string;
  type: QuestionFormType;
  difficulty: QuestionDifficulty;
  text: string;
  optionsText: string;
  correctAnswer: string;
  explanation: string;
  marks: string;
  negativeMarks: string;
  timeRecommended: string;
  tagsText: string;
  active: boolean;
}

const defaultFormState: FormState = {
  domain: '',
  topic: '',
  subtopic: '',
  type: 'mcq',
  difficulty: 'easy',
  text: '',
  optionsText: '',
  correctAnswer: '',
  explanation: '',
  marks: '1',
  negativeMarks: '0.25',
  timeRecommended: '60',
  tagsText: '',
  active: true,
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const fieldClass =
  'w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:border-brand-400 dark:focus:ring-brand-500/20';

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function toNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeForm(form: FormState): AdminQuestionInput {
  const options = form.type === 'true_false' ? ['True', 'False'] : form.type === 'fill' ? [] : splitLines(form.optionsText);

  return {
    domain: form.domain,
    topic: form.topic,
    subtopic: form.subtopic,
    type: form.type,
    difficulty: form.difficulty,
    text: form.text.trim(),
    options,
    correctAnswer: form.correctAnswer.trim(),
    explanation: form.explanation.trim(),
    marks: toNumber(form.marks, 1),
    negativeMarks: toNumber(form.negativeMarks, 0),
    timeRecommended: Math.trunc(toNumber(form.timeRecommended, 60)),
    tags: splitTags(form.tagsText),
    active: form.active,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700 dark:text-red-300">{message}</p>;
}

export default function AdminQuestionNewPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const taxonomyQuery = useAdminTaxonomy();
  const domains = taxonomyQuery.data ?? [];
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false);

  const selectedDomain = domains.find((domain) => domain.id === form.domain) ?? null;
  const selectedTopic = selectedDomain?.topics.find((topic) => topic.id === form.topic) ?? null;

  const optionChoices = useMemo(() => {
    if (form.type === 'true_false') {
      return ['True', 'False'];
    }

    if (form.type === 'fill') {
      return [];
    }

    return splitLines(form.optionsText);
  }, [form.optionsText, form.type]);

  useEffect(() => {
    if (form.domain || domains.length === 0) {
      return;
    }

    const firstDomain = domains[0];
    const firstTopic = firstDomain?.topics[0];
    const firstSubtopic = firstTopic?.subtopics[0];

    setForm((current) => ({
      ...current,
      domain: firstDomain?.id ?? '',
      topic: firstTopic?.id ?? '',
      subtopic: firstSubtopic?.id ?? '',
    }));
  }, [domains, form.domain]);

  useEffect(() => {
    if (form.type !== 'true_false') {
      return;
    }

    setForm((current) => ({
      ...current,
      optionsText: 'True\nFalse',
      correctAnswer: current.correctAnswer === 'False' ? 'False' : 'True',
      negativeMarks: '0',
    }));
  }, [form.type]);

  const updateForm = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  };

  const onDomainChange = (domainId: string) => {
    const nextDomain = domains.find((domain) => domain.id === domainId);
    const nextTopic = nextDomain?.topics[0];
    const nextSubtopic = nextTopic?.subtopics[0];

    setForm((current) => ({
      ...current,
      domain: domainId,
      topic: nextTopic?.id ?? '',
      subtopic: nextSubtopic?.id ?? '',
    }));
  };

  const onTopicChange = (topicId: string) => {
    const nextTopic = selectedDomain?.topics.find((topic) => topic.id === topicId);
    const nextSubtopic = nextTopic?.subtopics[0];

    setForm((current) => ({
      ...current,
      topic: topicId,
      subtopic: nextSubtopic?.id ?? '',
    }));
  };

  const refreshTaxonomy = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-taxonomy'] });
    await taxonomyQuery.refetch();
  };

  const onCreateTopic = async () => {
    const name = newTopicName.trim();
    if (!form.domain || !selectedDomain || !name) {
      return;
    }

    setIsCreatingTopic(true);
    setFormError(null);

    try {
      const topic = await createAdminTopic({
        domainId: form.domain,
        name,
        order: selectedDomain.topics.length + 1,
      });
      setForm((current) => ({
        ...current,
        topic: topic.id,
        subtopic: '',
      }));
      setNewTopicName('');
      setNewSubtopicName('');
      await refreshTaxonomy();
      toast.success('Topic added.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to add topic.');
      toast.error('Unable to add topic.');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const onCreateSubtopic = async () => {
    const name = newSubtopicName.trim();
    if (!form.domain || !form.topic || !selectedTopic || !name) {
      return;
    }

    setIsCreatingSubtopic(true);
    setFormError(null);

    try {
      const subtopic = await createAdminSubtopic({
        domainId: form.domain,
        topicId: form.topic,
        name,
        order: selectedTopic.subtopics.length + 1,
      });
      setForm((current) => ({
        ...current,
        subtopic: subtopic.id,
      }));
      setNewSubtopicName('');
      await refreshTaxonomy();
      toast.success('Subtopic added.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to add subtopic.');
      toast.error('Unable to add subtopic.');
    } finally {
      setIsCreatingSubtopic(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError('Sign in again before saving.');
      return;
    }

    const parsed = adminQuestionSchema.safeParse(normalizeForm(form));

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        domain: flattened.domain?.[0],
        topic: flattened.topic?.[0],
        subtopic: flattened.subtopic?.[0],
        type: flattened.type?.[0],
        difficulty: flattened.difficulty?.[0],
        text: flattened.text?.[0],
        optionsText: flattened.options?.[0],
        correctAnswer: flattened.correctAnswer?.[0],
        explanation: flattened.explanation?.[0],
        marks: flattened.marks?.[0],
        negativeMarks: flattened.negativeMarks?.[0],
        timeRecommended: flattened.timeRecommended?.[0],
        tagsText: flattened.tags?.[0],
      });
      setFormError('Fix the highlighted fields before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const questionId = await createAdminQuestion(parsed.data, user.uid);
      toast.success('Question saved with private answer key.');
      setForm((current) => ({
        ...defaultFormState,
        domain: current.domain,
        topic: current.topic,
        subtopic: current.subtopic,
      }));
      setFieldErrors({});
      setFormError(`Saved question ${questionId}.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save question.');
      toast.error('Unable to save question.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div>
          <Link
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            to="/admin"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Admin
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Add question</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Public question data is saved separately from the private answer key.
          </p>
        </div>

        {taxonomyQuery.isLoading ? <Card className="p-5 text-sm text-muted">Loading domains and topics...</Card> : null}
        {taxonomyQuery.isError ? (
          <Card className="p-5 text-sm text-red-700 dark:text-red-300">
            Unable to load domains. Confirm admin access and deployed Firestore rules.
          </Card>
        ) : null}

        <form className="grid gap-5" onSubmit={onSubmit}>
          <Card className="grid gap-5 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium">
                Domain
                <select className={fieldClass} value={form.domain} onChange={(event) => onDomainChange(event.target.value)}>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.domain} />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Topic
                <select className={fieldClass} value={form.topic} onChange={(event) => onTopicChange(event.target.value)}>
                  <option value="">Select topic</option>
                  {(selectedDomain?.topics ?? []).map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    disabled={!form.domain || isCreatingTopic}
                    placeholder="New topic"
                    value={newTopicName}
                    onChange={(event) => setNewTopicName(event.target.value)}
                  />
                  <Button
                    aria-label="Add topic"
                    className="min-h-11 shrink-0 px-3"
                    disabled={!form.domain || !newTopicName.trim() || isCreatingTopic}
                    onClick={onCreateTopic}
                    type="button"
                    variant="secondary"
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
                <FieldError message={fieldErrors.topic} />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Subtopic
                <select className={fieldClass} value={form.subtopic} onChange={(event) => updateForm('subtopic', event.target.value)}>
                  <option value="">Select subtopic</option>
                  {(selectedTopic?.subtopics ?? []).map((subtopic) => (
                    <option key={subtopic.id} value={subtopic.id}>
                      {subtopic.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    disabled={!form.topic || isCreatingSubtopic}
                    placeholder="New subtopic"
                    value={newSubtopicName}
                    onChange={(event) => setNewSubtopicName(event.target.value)}
                  />
                  <Button
                    aria-label="Add subtopic"
                    className="min-h-11 shrink-0 px-3"
                    disabled={!form.topic || !newSubtopicName.trim() || isCreatingSubtopic}
                    onClick={onCreateSubtopic}
                    type="button"
                    variant="secondary"
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
                <FieldError message={fieldErrors.subtopic} />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="grid gap-2 text-sm font-medium">
                Type
                <select
                  className={fieldClass}
                  value={form.type}
                  onChange={(event) => updateForm('type', event.target.value as QuestionFormType)}
                >
                  <option value="mcq">MCQ</option>
                  <option value="true_false">True / False</option>
                  <option value="fill">Fill</option>
                </select>
                <FieldError message={fieldErrors.type} />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Difficulty
                <select
                  className={fieldClass}
                  value={form.difficulty}
                  onChange={(event) => updateForm('difficulty', event.target.value as QuestionDifficulty)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <FieldError message={fieldErrors.difficulty} />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Marks
                <Input value={form.marks} onChange={(event) => updateForm('marks', event.target.value)} />
                <FieldError message={fieldErrors.marks} />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Negative marks
                <Input value={form.negativeMarks} onChange={(event) => updateForm('negativeMarks', event.target.value)} />
                <FieldError message={fieldErrors.negativeMarks} />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium">
              Question text
              <textarea
                className={fieldClass}
                rows={4}
                value={form.text}
                onChange={(event) => updateForm('text', event.target.value)}
              />
              <FieldError message={fieldErrors.text} />
            </label>

            {form.type !== 'fill' ? (
              <label className="grid gap-2 text-sm font-medium">
                Options
                <textarea
                  className={fieldClass}
                  disabled={form.type === 'true_false'}
                  rows={5}
                  value={form.optionsText}
                  onChange={(event) => updateForm('optionsText', event.target.value)}
                  placeholder="One option per line"
                />
                <FieldError message={fieldErrors.optionsText} />
              </label>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Correct answer
                {optionChoices.length > 0 ? (
                  <select
                    className={fieldClass}
                    value={form.correctAnswer}
                    onChange={(event) => updateForm('correctAnswer', event.target.value)}
                  >
                    <option value="">Select answer</option>
                    {optionChoices.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input value={form.correctAnswer} onChange={(event) => updateForm('correctAnswer', event.target.value)} />
                )}
                <FieldError message={fieldErrors.correctAnswer} />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Recommended time seconds
                <Input
                  value={form.timeRecommended}
                  onChange={(event) => updateForm('timeRecommended', event.target.value)}
                />
                <FieldError message={fieldErrors.timeRecommended} />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium">
              Private explanation
              <textarea
                className={fieldClass}
                rows={4}
                value={form.explanation}
                onChange={(event) => updateForm('explanation', event.target.value)}
              />
              <FieldError message={fieldErrors.explanation} />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Tags
              <Input
                value={form.tagsText}
                onChange={(event) => updateForm('tagsText', event.target.value)}
                placeholder="aptitude, percentage, exam"
              />
              <FieldError message={fieldErrors.tagsText} />
            </label>

            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                checked={form.active}
                className="h-4 w-4 rounded border-border"
                onChange={(event) => updateForm('active', event.target.checked)}
                type="checkbox"
              />
              Active question
            </label>
          </Card>

          {formError ? <Card className="p-4 text-sm text-muted">{formError}</Card> : null}

          <div className="flex justify-end">
            <Button disabled={isSaving || taxonomyQuery.isLoading} type="submit">
              <Save aria-hidden="true" className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving question' : 'Save question'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
