import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Database, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../features/auth/AuthProvider';
import { appCopy } from '../lib/constants/copy';

const statusItems = [
  { label: 'Firebase modular client', detail: 'Auth, Firestore, Functions, Storage', icon: Database },
  { label: 'Security baseline', detail: 'Deny-by-default rules and private answer keys', icon: ShieldCheck },
  { label: 'Responsive shell', detail: 'Keyboard focus, dark mode, mobile-safe layout', icon: CheckCircle2 },
  { label: 'Milestone flow', detail: 'Ready for Auth in Milestone 2', icon: Clock3 },
] as const;

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">{appCopy.productName}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {appCopy.home.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{appCopy.home.subtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={user ? '/dashboard' : '/signup'}>
                <Button className="w-full gap-2 sm:w-auto">
                  {user ? 'Open dashboard' : appCopy.home.primaryAction}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/tests">
                <Button variant="secondary" className="w-full sm:w-auto">
                  {appCopy.home.secondaryAction}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {statusItems.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.label} className="min-h-40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border pt-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{appCopy.home.readinessTitle}</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted">{appCopy.home.readinessSubtitle}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
