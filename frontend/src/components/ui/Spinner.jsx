import React from 'react';

/**
 * Accessible SVG loading spinner.
 *
 * @param {object} props
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {'primary'|'white'|'current'|'slate'} [props.color='current']
 * @param {string} [props.className]
 * @param {string} [props.label='Loading...']
 */
export function Spinner({
  size = 'md',
  color = 'current',
  className = '',
  label = 'Loading...',
  ...props
}) {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  const colorClasses = {
    primary: 'text-brand-600',
    white: 'text-white',
    current: 'text-current',
    slate: 'text-slate-500',
  };

  return (
    <svg
      role="status"
      aria-label={label}
      className={`animate-spin ${sizeClasses[size] || sizeClasses.md} ${
        colorClasses[color] || colorClasses.current
      } ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Spinner;
