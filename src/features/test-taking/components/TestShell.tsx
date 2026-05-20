import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { Menu, X } from 'lucide-react';
import { functions } from '../../../lib/firebase/client';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { useTestSessionStore } from '../store/testSessionStore';
import { useTestAutosave } from '../hooks/useTestAutosave';
import { useTabSwitchGuard } from '../hooks/useTabSwitchGuard';
import { useCountdown } from '../hooks/useCountdown';
import { CountdownTimer } from './CountdownTimer';
import { QuestionNavigator } from './QuestionNavigator';
import { QuestionCard } from './QuestionCard';
import { SubmitConfirmModal } from './SubmitConfirmModal';
import type { TestSession } from '../types';

interface SubmitResult {
  resultId: string;
}

interface TestShellProps {
  session: TestSession;
}

export function TestShell({ session }: TestShellProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const answers = useTestSessionStore((s) => s.answers);
  const markedForReview = useTestSessionStore((s) => s.markedForReview);
  const currentIndex = useTestSessionStore((s) => s.currentQuestionIndex);
  const setAnswer = useTestSessionStore((s) => s.setAnswer);
  const clearAnswer = useTestSessionStore((s) => s.clearAnswer);
  const toggleMark = useTestSessionStore((s) => s.toggleMark);
  const goTo = useTestSessionStore((s) => s.goTo);

  const saveStatus = useTestAutosave(session.id);
  useTabSwitchGuard(session.id, session.status === 'in_progress');

  const questions = session.questionSnapshot;
  const question = questions[currentIndex];

  const submitTest = async () => {
    setIsSubmitting(true);
    try {
      const submit = httpsCallable<{ sessionId: string }, SubmitResult>(
        functions,
        'submitTest',
      );
      const result = await submit({ sessionId: session.id });
      navigate(`/results/${result.data.resultId}`, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      toast.error(msg);
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const handleAutoSubmit = () => {
    toast.info('Time is up! Submitting your test…');
    void submitTest();
  };

  const remaining = useCountdown(session.expiresAt, handleAutoSubmit);

  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        No questions in this session.
      </div>
    );
  }

  const currentAnswer = answers[question.id] ?? '';
  const currentMarked = Boolean(markedForReview[question.id]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle navigator"
            className="rounded-lg p-2 text-muted transition hover:bg-surfaceSoft lg:hidden"
            onClick={() => setDrawerOpen((v) => !v)}
            type="button"
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-medium text-muted">
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : ''}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <CountdownTimer remaining={remaining} />
          <Button onClick={() => setShowModal(true)} type="button" variant="secondary">
            Submit
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar navigator — desktop */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-5 lg:block">
          <QuestionNavigator
            questions={questions}
            answers={answers}
            markedForReview={markedForReview}
            currentIndex={currentIndex}
            onNavigate={(idx) => {
              goTo(idx);
              setDrawerOpen(false);
            }}
          />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-30 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <aside className="relative z-10 w-72 overflow-y-auto border-r border-border bg-surface p-5">
              <QuestionNavigator
                questions={questions}
                answers={answers}
                markedForReview={markedForReview}
                currentIndex={currentIndex}
                onNavigate={(idx) => {
                  goTo(idx);
                  setDrawerOpen(false);
                }}
              />
            </aside>
          </div>
        )}

        {/* Main question area */}
        <main className="flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <Card className="p-6">
              <QuestionCard
                question={question}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                answer={currentAnswer}
                isMarked={currentMarked}
                onAnswer={(ans) => setAnswer(question.id, ans)}
                onClear={() => clearAnswer(question.id)}
                onToggleMark={() => toggleMark(question.id)}
                onNext={() => goTo(Math.min(currentIndex + 1, questions.length - 1))}
                onPrev={() => goTo(Math.max(currentIndex - 1, 0))}
              />
            </Card>
          </div>
        </main>
      </div>

      {showModal && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          markedCount={markedCount}
          isSubmitting={isSubmitting}
          onConfirm={() => void submitTest()}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
