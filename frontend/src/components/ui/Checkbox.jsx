import React, { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

/**
 * Accessible SaaS Checkbox.
 */
export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    error,
    checked,
    onChange,
    disabled = false,
    className = '',
    id: explicitId,
    ...props
  },
  ref
) {
  const autoId = useId();
  const id = explicitId || autoId;

  return (
    <div className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative flex items-center h-5">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all duration-150 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white ${
            checked
              ? 'bg-brand-600 border-brand-600 text-white'
              : error
              ? 'bg-white border-danger-500 hover:border-danger-600'
              : 'bg-white border-slate-300 hover:border-slate-400'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </label>
      </div>

      {(label || description) && (
        <div className="text-xs select-none">
          {label && (
            <label
              htmlFor={id}
              className={`font-medium cursor-pointer block ${
                error ? 'text-danger-600' : 'text-slate-800'
              }`}
            >
              {label}
            </label>
          )}
          {description && <p className="text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
});

export default Checkbox;
