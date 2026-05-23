import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = 'brainova-theme';

function resolveTheme(theme: Theme) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const ThemeIcon = ({ dark }: { dark: boolean }) =>
  dark ? <Moon aria-hidden="true" className="h-5 w-5" /> : <Sun aria-hidden="true" className="h-5 w-5" />;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition hover:bg-surfaceSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

export function ThemeProvider({ children, defaultTheme = 'system', enableSystem = true }: ThemeProviderProps) {
  const getInitialTheme = () => {
    if (typeof window === 'undefined') {
      return defaultTheme as Theme;
    }

    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    if (stored === 'light' || stored === 'dark' || (enableSystem && stored === 'system')) {
      return stored;
    }

    return enableSystem ? (defaultTheme as Theme) : 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return resolveTheme(getInitialTheme());
  });

  useEffect(() => {
    const nextResolvedTheme = resolveTheme(theme);
    setResolvedTheme(nextResolvedTheme);
    applyTheme(nextResolvedTheme);
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const nextResolvedTheme = resolveTheme('system');
      setResolvedTheme(nextResolvedTheme);
      applyTheme(nextResolvedTheme);
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

export function ThemeAwareSkeleton({ className = '' }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surfaceSoft', className)} />;
}
