import React, { forwardRef, useId } from 'react';

/**
 * Accessible SaaS Multi-line Textarea.
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    maxLength,
    value,
    className = '',
    wrapperClassName = '',
    id: explicitId,
    rows = 4,
    ...props
  },
  ref
) {
  const autoId = useId();
  const id = explicitId || autoId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-slate-300 select-none"
          >
            {label}
            {required && <span className="text-danger-400 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-[11px] text-slate-500 font-mono">
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={id}
        rows={rows}
        disabled={disabled}
        value={value}
        maxLength={maxLength}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`w-full bg-slate-900/90 text-slate-100 text-sm rounded-lg border p-3 transition-all duration-150 placeholder:text-slate-500 disabled:bg-slate-900/40 disabled:text-slate-500 disabled:cursor-not-allowed resize-y ${
          error
            ? 'border-danger-500/80 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
            : 'border-slate-700/80 hover:border-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
        } focus:outline-none ${className}`}
        {...props}
      />

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-danger-400 font-medium animate-fade-in">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="mt-1.5 text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Textarea;
