import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'default' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
};

export function Button({ className = '', children, variant = 'default', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
