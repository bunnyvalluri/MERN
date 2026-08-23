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
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    primary: 'bg-brand-500/10 text-brand-300 border-brand-500/30',
    success: 'bg-success-500/10 text-success-300 border-success-500/30',
    warning: 'bg-warning-500/10 text-warning-300 border-warning-500/30',
    danger: 'bg-danger-500/10 text-danger-300 border-danger-500/30',
    info: 'bg-info-500/10 text-info-300 border-info-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    primary: 'bg-brand-400',
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    danger: 'bg-danger-400',
    info: 'bg-info-400',
    purple: 'bg-purple-400',
  };

  const sizeClasses = {
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
