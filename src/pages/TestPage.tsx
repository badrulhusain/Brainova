import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeAwareSkeleton } from '../components/ui/theme-toggle';
import { Card } from '../components/ui/card';
import { useAuth } from '../features/auth/AuthProvider';
import { useTestSession } from '../features/test-taking/hooks/useTestSession';
import { useTestSessionStore } from '../features/test-taking/store/testSessionStore';
import { TestShell } from '../features/test-taking/components/TestShell';

export default function TestPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const reset = useTestSessionStore((s) => s.reset);

  const id = sessionId ?? '';
  const { session, isLoading, error } = useTestSession(id);

  // Reset store when leaving the test
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Guard: redirect if session doesn't belong to current user
  useEffect(() => {
    if (!session || !user) return;
    if (session.userId !== user.uid) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, user, navigate]);

  // Redirect completed sessions to results list
  useEffect(() => {
    if (!session) return;
    if (session.status === 'SUBMITTED') {
      navigate('/results', { replace: true });
    }
  }, [session, navigate]);

  if (!sessionId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Card className="max-w-sm p-8 text-center">
          <p className="text-muted">Invalid session URL.</p>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col gap-4 bg-background p-8">
        <ThemeAwareSkeleton className="h-16 w-full" />
        <div className="flex flex-1 gap-4">
          <ThemeAwareSkeleton className="h-full w-64" />
          <div className="flex flex-1 flex-col gap-4">
            <ThemeAwareSkeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Card className="max-w-sm p-8 text-center">
          <p className="text-sm text-red-700 dark:text-red-300">
            {error ?? 'Session not found.'}
          </p>
        </Card>
      </main>
    );
  }

  if (session.status !== 'IN_PROGRESS') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Card className="max-w-sm p-8 text-center">
          <p className="text-muted">This session is no longer active.</p>
        </Card>
      </main>
    );
  }

  return <TestShell session={session} />;
}
