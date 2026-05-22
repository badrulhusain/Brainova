import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../features/auth/AuthProvider';
import { appCopy } from '../lib/constants/copy';

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const displayName = profile?.displayName ?? 'Student';

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-8">
          <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome, {displayName}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Your authentication session is active. Tests, history, and analytics unlock as the next milestones land.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/tests">
              <Button className="w-full sm:w-auto">View tests</Button>
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
              <dd className="mt-1 text-foreground">{profile?.isAnonymous ? 'Guest' : 'Registered'}</dd>
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
      </div>
    </main>
  );
}
