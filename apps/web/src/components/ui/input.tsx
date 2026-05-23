import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-500/20',
        className,
      )}
      {...props}
    />
  );
});
