import React, { forwardRef } from 'react';
import Spinner from './Spinner.jsx';

/**
 * Premium SaaS Button Component.
 *
 * @typedef {object} ButtonProps
 * @property {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'|'link'} [variant='primary']
 * @property {'xs'|'sm'|'md'|'lg'|'icon'} [size='md']
 * @property {boolean} [isLoading=false]
 * @property {string} [loadingText]
 * @property {React.ReactNode} [leftIcon]
 * @property {React.ReactNode} [rightIcon]
 * @property {boolean} [fullWidth=false]
 * @property {boolean} [disabled=false]
 * @property {string} [className]
 * @property {React.ReactNode} children
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled = false,
    className = '',
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const variantClasses = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow focus-visible:ring-brand-500 border border-transparent',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm focus-visible:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 focus-visible:ring-brand-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent focus-visible:ring-slate-400',
    danger:
      'bg-danger-600 hover:bg-danger-700 text-white shadow-sm hover:shadow focus-visible:ring-danger-500 border border-transparent',
    success:
      'bg-success-600 hover:bg-success-700 text-white shadow-sm hover:shadow focus-visible:ring-success-500 border border-transparent',
    link: 'bg-transparent text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline p-0 h-auto font-normal focus-visible:ring-brand-500',
  };

  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5 gap-1.5 h-7',
    sm: 'text-xs px-3 py-2 gap-1.5 h-8.5',
    md: 'text-sm px-4 py-2.5 gap-2 h-10',
    lg: 'text-base px-5 py-3 gap-2.5 h-12',
    icon: 'p-2 h-10 w-10 justify-center',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        variant !== 'link' ? sizeClasses[size] || sizeClasses.md : ''
      } ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'}
          />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;
