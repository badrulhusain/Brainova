import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeIcon = ({ dark }: { dark: boolean }) => (dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />);

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = stored ?? (prefersDark ? 'dark' : 'light');
    setIsDark(activeTheme === 'dark');
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    window.localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    setIsDark(nextTheme === 'dark');
  };

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-900 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      <ThemeIcon dark={isDark} />
    </button>
  );
}

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
