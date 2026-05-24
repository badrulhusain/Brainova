import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

import { toast } from 'sonner';
import { useAuth } from '../../features/auth/AuthProvider';
import { appCopy } from '../../lib/constants/copy';
import { ThemeToggle } from '../ui/theme-toggle';

const studentNavigation = [
  { label: appCopy.nav.dashboard, to: '/dashboard', icon: LayoutDashboard },
  { label: 'Aptitude', to: '/aptitude', icon: BrainCircuit },
] as const;

const adminNavigation = [
  { label: appCopy.nav.admin, to: '/admin', icon: ShieldCheck },
] as const;

export function PageShell({ children }: { children: ReactNode }) {
  const { user, profile, isLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const visibleNavigation = isAdmin ? adminNavigation : studentNavigation;

  const onSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to={isAdmin ? '/admin' : '/'}
            className="rounded-lg text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {appCopy.productName}
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surfaceSoft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                {isAdmin ? (
                  <span className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted md:inline-flex">
                    {profile?.displayName ?? 'Administrator'}
                  </span>
                ) : (
                  <Link
                    to="/dashboard"
                    className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surfaceSoft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
                  >
                    {profile?.displayName ?? 'Student'}
                  </Link>
                )}
                <button
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surfaceSoft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={onSignOut}
                  type="button"
                >
                  {appCopy.auth.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <LogIn aria-hidden="true" className="h-4 w-4" />
                  {appCopy.nav.login}
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border bg-background px-4 py-6 text-center text-sm text-muted sm:px-6">
        {appCopy.footer}
      </footer>
    </div>
  );
}
