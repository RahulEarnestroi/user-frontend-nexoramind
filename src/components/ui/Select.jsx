import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(function Select({ label, error, className, children, ...props }, ref) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white',
          error ? 'border-danger-500' : 'border-slate-200',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
});

export default Select;
