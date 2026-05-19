import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ui/theme-toggle';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            Aptitude Connect
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Login
            </Link>
            <Link to="/signup" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              Sign up
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div>{children}</div>
      <footer className="border-t border-slate-200 bg-white/90 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-400 sm:px-6">
        Built for next-gen aptitude testing.
      </footer>
    </div>
  );
}
