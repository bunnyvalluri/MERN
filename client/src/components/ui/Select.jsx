import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Accessible SaaS Select Field.
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Select an option...',
    required = false,
    disabled = false,
    className = '',
    wrapperClassName = '',
    id: explicitId,
    children,
    value,
    ...props
  },
  ref
) {
  const autoId = useId();
  const id = explicitId || autoId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-slate-300 mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-danger-400 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          value={value}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full appearance-none bg-slate-900/90 text-slate-100 text-sm rounded-lg border py-2.5 pl-3.5 pr-10 transition-all duration-150 disabled:bg-slate-900/40 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer ${
            error
              ? 'border-danger-500/80 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
              : 'border-slate-700/80 hover:border-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          } focus:outline-none ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900 text-slate-500">
              {placeholder}
            </option>
          )}

          {options.length > 0
            ? options.map((opt) => {
                const isObj = typeof opt === 'object' && opt !== null;
                const optVal = isObj ? opt.value : opt;
                const optLabel = isObj ? opt.label : opt;
                const optDisabled = isObj ? Boolean(opt.disabled) : false;

                return (
                  <option
                    key={optVal}
                    value={optVal}
                    disabled={optDisabled}
                    className="bg-slate-900 text-slate-100 py-1"
                  >
                    {optLabel}
                  </option>
                );
              })
            : children}
        </select>

        <div className="absolute right-3 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

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

export default Select;
