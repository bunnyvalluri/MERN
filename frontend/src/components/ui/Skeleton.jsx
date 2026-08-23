import React from 'react';

/**
 * Premium SaaS Skeleton Loaders with Shimmer Animation.
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-slate-200 rounded-lg animate-shimmer ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        // Give the last line a realistic shorter width
        const widthClass =
          index === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full';

        return (
          <Skeleton
            key={index}
            className={`h-3.5 rounded ${widthClass}`}
          />
        );
      })}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  return (
    <Skeleton
      className={`rounded-full shrink-0 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 w-3/4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`row-${r}`}
          className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-slate-100"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`cell-${r}-${c}`} className="h-3.5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
