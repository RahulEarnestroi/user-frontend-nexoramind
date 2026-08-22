import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-white border border-slate-200 dark:border-white/[0.1] hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:border-slate-300 dark:hover:border-white/[0.2] hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]',
  danger: 'bg-red-500/90 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25',
  success: 'bg-emerald-500/90 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25',
  outline: 'border border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-500/50',
  dark: 'bg-slate-800 dark:bg-slate-900 text-white hover:bg-slate-700 dark:hover:bg-slate-800 hover:shadow-lg',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-sm rounded-xl',
  xl: 'px-8 py-4 text-base rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
