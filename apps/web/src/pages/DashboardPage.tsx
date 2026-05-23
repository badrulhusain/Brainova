import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../features/auth/AuthProvider';
import { useLatestAptitudeResult } from '../features/aptitude/hooks/useLatestAptitudeResult';
import { appCopy } from '../lib/constants/copy';

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const latestAptitudeResult = useLatestAptitudeResult();
  const displayName = profile?.displayName ?? 'Student';
  const hasAptitudeResult = Boolean(latestAptitudeResult.data);

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-8">
          <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome, {displayName}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Your authentication session is active. Start the career aptitude assessment, then review
            your profile and recommendations.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/aptitude">
              <Button className="w-full sm:w-auto">Start aptitude</Button>
            </Link>
            <Link to="/analytics">
              <Button className="w-full sm:w-auto" variant="secondary">
                View analytics
              </Button>
            </Link>
          </div>
        </Card>
        <Card className="p-8">
          <h2 className="text-xl font-semibold">Session status</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted">Account type</dt>
              <dd className="mt-1 text-foreground">
                {profile?.isAnonymous ? 'Guest' : 'Registered'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted">Admin claim</dt>
              <dd className="mt-1 text-foreground">{isAdmin ? 'Enabled' : 'Not enabled'}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted">Product</dt>
              <dd className="mt-1 text-foreground">{appCopy.productName}</dd>
            </div>
          </dl>
        </Card>
        <Link className="lg:col-span-2" to="/aptitude">
          <Card className="flex flex-col gap-4 p-6 transition hover:border-brand-300 hover:bg-surfaceSoft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Discover Your Aptitude</h2>
              <p className="mt-2 text-sm text-muted">
                Take a 30-question assessment across ten master career categories.
              </p>
            </div>
            <span
              className={
                hasAptitudeResult
                  ? 'self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 sm:self-center'
                  : 'self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 sm:self-center'
              }
            >
              {hasAptitudeResult ? 'Completed' : 'Start'}
            </span>
          </Card>
        </Link>
      </div>
    </main>
  );
}
