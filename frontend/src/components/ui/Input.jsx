import React, { forwardRef, useState, useId } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

/**
 * Accessible SaaS Input Field.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = 'text',
    leftIcon,
    rightIcon,
    onClear,
    showClearButton = false,
    required = false,
    disabled = false,
    className = '',
    wrapperClassName = '',
    id: explicitId,
    value,
    ...props
  },
  ref
) {
  const autoId = useId();
  const id = explicitId || autoId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const effectiveType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-slate-700 mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-danger-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={effectiveType}
          disabled={disabled}
          value={value}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full bg-white text-slate-900 text-sm rounded-lg border transition-all duration-150 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${
            isPasswordType || showClearButton || rightIcon ? 'pr-10' : 'pr-3.5'
          } py-2.5 ${
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
          } focus:outline-none shadow-sm ${className}`}
          {...props}
        />

        <div className="absolute right-3 flex items-center gap-1.5 text-slate-400">
          {showClearButton && value && onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear input"
              className="p-0.5 rounded hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-0.5 rounded hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}

          {rightIcon && !isPasswordType && (
            <span className="flex items-center pointer-events-none">{rightIcon}</span>
          )}
        </div>
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-danger-600 font-medium flex items-center gap-1 animate-fade-in">
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="mt-1.5 text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
