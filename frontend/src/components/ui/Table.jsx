import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Premium SaaS Responsive Table Suite.
 */
export function Table({ className = '', containerClassName = '', children, ...props }) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 ${containerClassName}`}>
      <table className={`w-full text-left text-xs sm:text-sm border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children, ...props }) {
  return (
    <thead className={`bg-slate-900/90 border-b border-slate-800 text-slate-400 select-none ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = '', children, ...props }) {
  return (
    <tbody className={`divide-y divide-slate-800/60 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableFooter({ className = '', children, ...props }) {
  return (
    <tfoot className={`bg-slate-900/90 border-t border-slate-800 font-medium text-slate-300 ${className}`} {...props}>
      {children}
    </tfoot>
  );
}

export function TableRow({
  hoverable = true,
  selected = false,
  className = '',
  children,
  ...props
}) {
  return (
    <tr
      className={`transition-colors ${
        selected
          ? 'bg-brand-500/10'
          : hoverable
          ? 'hover:bg-slate-800/40'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  sortable = false,
  sortDirection,
  onSort,
  align = 'left',
  className = '',
  children,
  ...props
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th
      scope="col"
      className={`py-3.5 px-4 font-semibold text-slate-300 text-xs tracking-wider uppercase ${
        alignClasses[align] || alignClasses.left
      } ${className}`}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1.5 hover:text-slate-100 transition-colors uppercase tracking-wider font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded"
        >
          <span>{children}</span>
          <span className="text-slate-500">
            {sortDirection === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-brand-400" />
            ) : sortDirection === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-brand-400" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5" />
            )}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TableCell({ align = 'left', className = '', children, ...props }) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={`py-3.5 px-4 text-slate-200 ${
        alignClasses[align] || alignClasses.left
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableCaption({ className = '', children, ...props }) {
  return (
    <caption className={`p-3 text-xs text-slate-500 text-center ${className}`} {...props}>
      {children}
    </caption>
  );
}

export default Table;
