import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-600 dark:text-white/60">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border rounded-xl text-sm text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-slate-400 dark:placeholder:text-white/30',
          error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
});

export default Input;
