import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/utils/cn';

type ButtonVariant = 'default' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'border border-border bg-surface text-foreground hover:bg-surfaceSoft focus-visible:ring-slate-400',
  ghost: 'text-muted hover:bg-surfaceSoft hover:text-foreground focus-visible:ring-brand-500',
};

export function Button({ className = '', children, variant = 'default', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
