import React from 'react';
import { X } from 'lucide-react';

/**
 * Premium Status & Category Badge Component.
 *
 * @param {object} props
 * @param {'neutral'|'primary'|'success'|'warning'|'danger'|'info'|'purple'} [props.variant='neutral']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.dot=false]
 * @param {boolean} [props.pulse=false]
 * @param {Function} [props.onRemove]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  onRemove,
  leftIcon,
  className = '',
  children,
  ...props
}) {
  const variantClasses = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dotColors = {
    neutral: 'bg-slate-500',
    primary: 'bg-brand-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    info: 'bg-sky-600',
    purple: 'bg-purple-600',
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1 leading-tight',
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border select-none transition-colors ${
        variantClasses[variant] || variantClasses.neutral
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dotColors[variant] || dotColors.neutral
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              dotColors[variant] || dotColors.neutral
            }`}
          />
        </span>
      )}
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove badge"
          className="ml-0.5 inline-flex items-center justify-center rounded-full hover:bg-slate-700/60 p-0.5 text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

export default Badge;
