import { useAuth } from '../features/auth/AuthProvider';
import { AttemptHistoryTable } from '../features/analytics/components/AttemptHistoryTable';

export default function ResultsListPage() {
  const { user } = useAuth();

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">My results</h1>
        <p className="mt-2 text-muted">All your completed test attempts.</p>
        <div className="mt-8">
          {user ? (
            <AttemptHistoryTable uid={user.uid} />
          ) : (
            <p className="text-center text-sm text-muted">Sign in to see your results.</p>
          )}
        </div>
      </div>
    </main>
  );
}
