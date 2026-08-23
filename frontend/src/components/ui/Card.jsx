import React, { forwardRef } from 'react';

/**
 * Premium SaaS Card Component Suite.
 */
export const Card = forwardRef(function Card(
  {
    variant = 'default',
    hoverable = false,
    clickable = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const variantClasses = {
    default: 'bg-white border-slate-200 shadow-card text-slate-800',
    subtle: 'bg-slate-50/70 border-slate-200/80 text-slate-800',
    outline: 'bg-transparent border-slate-200 text-slate-800',
    glass: 'bg-white/80 backdrop-blur-md border-slate-200 shadow-dropdown text-slate-800',
  };

  const hoverClasses = hoverable
    ? 'hover:border-slate-300 hover:shadow-card-hover transition-all duration-200'
    : '';

  const clickClasses = clickable
    ? 'cursor-pointer active:scale-[0.99] transition-transform duration-100 select-none'
    : '';

  return (
    <div
      ref={ref}
      className={`rounded-xl border ${variantClasses[variant] || variantClasses.default} ${hoverClasses} ${clickClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-5 sm:p-6 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, as: Component = 'h3', ...props }) {
  return (
    <Component className={`text-base sm:text-lg font-semibold text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-xs sm:text-sm text-slate-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={`p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center rounded-b-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
