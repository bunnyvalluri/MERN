import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Accessible SaaS Breadcrumb Navigation.
 */
export function Breadcrumbs({
  items = [],
  separator = <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
  className = '',
  children,
}) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs sm:text-sm ${className}`}>
      <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {items.length > 0
          ? items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={index} className="inline-flex items-center gap-1.5 sm:gap-2">
                  {index > 0 && <span aria-hidden="true">{separator}</span>}

                  {isLast ? (
                    <span
                      aria-current="page"
                      className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs"
                    >
                      {item.icon && <span className="mr-1.5 inline-flex">{item.icon}</span>}
                      {item.label}
                    </span>
                  ) : item.href || item.onClick ? (
                    <a
                      href={item.href || '#'}
                      onClick={item.onClick}
                      className="font-medium text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center"
                    >
                      {item.icon && <span className="mr-1.5 inline-flex">{item.icon}</span>}
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-slate-400 inline-flex items-center">
                      {item.icon && <span className="mr-1.5 inline-flex">{item.icon}</span>}
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })
          : children}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
