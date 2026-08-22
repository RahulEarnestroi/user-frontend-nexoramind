import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-white/[0.06] text-white/60 border border-white/[0.08]',
  primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/15',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/15',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/15',
};

export default function Badge({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
