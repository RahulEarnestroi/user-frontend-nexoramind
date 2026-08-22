import { cn } from '../../lib/utils';

export default function Card({ className, children, hover = false, dark = true, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06]',
        hover && 'hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] transition-all duration-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-6 py-4 border-b border-slate-200 dark:border-white/[0.06]', className)}>{children}</div>;
}

export function CardContent({ className, children }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn('px-6 py-4 border-t border-slate-200 dark:border-white/[0.06]', className)}>{children}</div>;
}
