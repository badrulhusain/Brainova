import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ThemeToggle } from '../components/ui/theme-toggle';

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/90 p-8 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Aptitude Connect</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Deep aptitude analytics for every learner.</h1>
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                Start your first test, track learning progress, and turn performance insights into a focused study plan.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <Card>
              <h2 className="text-xl font-semibold">Ready to learn?</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Sign in to access your personalized dashboard and analytical result reports.
              </p>
              <Link to="/login">
                <Button className="mt-4">Login</Button>
              </Link>
            </Card>
            <Card>
              <h2 className="text-xl font-semibold">New here?</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Create an account and complete onboarding to save your progress and performance history.
              </p>
              <Link to="/signup">
                <Button variant="secondary" className="mt-4">Sign up</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
