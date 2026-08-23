import React from 'react';
import { FolderSearch } from 'lucide-react';

/**
 * Premium SaaS Empty State Component.
 */
export function EmptyState({
  icon: customIcon,
  title = 'No records found',
  description = 'There is no data to display right now. Check back later or try adjusting your filters.',
  primaryAction,
  secondaryAction,
  variant = 'card',
  className = '',
}) {
  const icon =
    customIcon !== undefined ? (
      customIcon
    ) : (
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
        <FolderSearch className="w-6 h-6" />
      </div>
    );

  const containerStyles = {
    card: 'bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm',
    dashed: 'border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl p-8 sm:p-12',
    plain: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center animate-fade-in ${
        containerStyles[variant] || containerStyles.card
      } ${className}`}
    >
      <div className="mb-4">{icon}</div>

      <h4 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight max-w-md">
        {title}
      </h4>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
