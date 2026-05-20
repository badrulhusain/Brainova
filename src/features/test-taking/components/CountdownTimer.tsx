import { cn } from '../../../lib/utils/cn';

interface CountdownTimerProps {
  remaining: number; // seconds
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CountdownTimer({ remaining }: CountdownTimerProps) {
  const isRed = remaining <= 60;
  const isAmber = !isRed && remaining <= 300;

  return (
    <div
      aria-label={`Time remaining: ${formatTime(remaining)}`}
      aria-live="polite"
      className={cn(
        'inline-flex items-center rounded-lg border px-4 py-2 font-mono text-base font-semibold tabular-nums transition-colors',
        isRed
          ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300'
          : isAmber
            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            : 'border-border bg-surface text-foreground',
      )}
    >
      {formatTime(remaining)}
    </div>
  );
}
