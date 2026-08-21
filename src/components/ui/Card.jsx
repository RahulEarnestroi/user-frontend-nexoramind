import { cn } from '../../lib/utils';

export default function Card({ className, children, hover = false, dark = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border card-shadow',
        dark
          ? 'bg-accent-800/80 border-white/10 text-white'
          : 'bg-white border-slate-100',
        hover && 'hover:card-shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-6 py-4 border-b border-slate-100', className)}>{children}</div>;
}

export function CardContent({ className, children }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn('px-6 py-4 border-t border-slate-100', className)}>{children}</div>;
}
