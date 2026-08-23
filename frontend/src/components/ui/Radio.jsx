import React, { forwardRef, useId } from 'react';

/**
 * Accessible SaaS Radio Input.
 */
export const Radio = forwardRef(function Radio(
  {
    label,
    description,
    name,
    value,
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
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all duration-150 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white ${
            checked
              ? 'border-brand-600 bg-brand-600'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </label>
      </div>

      {(label || description) && (
        <div className="text-xs select-none">
          {label && (
            <label
              htmlFor={id}
              className="font-medium text-slate-800 cursor-pointer block"
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

export default Radio;
