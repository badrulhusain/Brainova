import type { PropsWithChildren } from 'react';

export function Card({ className = '', children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95 ${className}`}>
      {children}
    </div>
  );
}
