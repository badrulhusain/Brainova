import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Clock3, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../features/auth/AuthProvider';

const features = [
  {
    label: 'Timed tests',
    detail: 'Countdown timer with auto-submit when time runs out.',
    icon: Clock3,
  },
  {
    label: 'Instant scoring',
    detail: 'Server-side scoring with negative marks and topic breakdown.',
    icon: BarChart2,
  },
  {
    label: 'Question review',
    detail: 'Review every answer with correct solution and explanation.',
    icon: BookOpen,
  },
  {
    label: 'Secure by design',
    detail: 'Answer keys stay private on the server. No client-side cheating.',
    icon: ShieldCheck,
  },
] as const;

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Brainova</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Career aptitude platform
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Take a focused career aptitude assessment and discover which master career category
                best matches your strengths.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={user ? '/dashboard' : '/signup'}>
                <Button className="w-full gap-2 sm:w-auto">
                  {user ? 'Open dashboard' : 'Sign up'}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Link to="/login">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item) => {
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
      </div>
    </main>
  );
}
