import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary-900 text-white hover:shadow-lg hover:shadow-[#00]/25 hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-[#7028C0] text-white hover:shadow-lg hover:shadow-[#7028C0]/25 hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25',
  outline: 'border border-[#0080F8]/30 text-[#0080F8] hover:bg-[#0080F8]/5 hover:border-[#0080F8]/50',
  dark: 'bg-[#080860] text-white hover:bg-[#060650] hover:shadow-lg',
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
