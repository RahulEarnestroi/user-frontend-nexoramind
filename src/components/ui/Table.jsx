import { cn } from '../../lib/utils';

export default function Table({ className, children }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>;
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function Th({ className, children }) {
  return <th className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider', className)}>{children}</th>;
}

export function Td({ className, children }) {
  return <td className={cn('px-4 py-3 text-slate-700', className)}>{children}</td>;
}

export function Tr({ className, children }) {
  return <tr className={cn('hover:bg-slate-50 transition-colors', className)}>{children}</tr>;
}
