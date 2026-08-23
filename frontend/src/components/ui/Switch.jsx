import React, { forwardRef, useId } from 'react';

/**
 * Accessible SaaS Toggle Switch.
 */
export const Switch = forwardRef(function Switch(
  {
    label,
    description,
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    className = '',
    id: explicitId,
    ...props
  },
  ref
) {
  const autoId = useId();
  const id = explicitId || autoId;

  const trackSizes = {
    sm: 'w-8 h-4.5',
    md: 'w-10 h-6',
    lg: 'w-12 h-7',
  };

  const thumbSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
  };

  const thumbTranslate = {
    sm: checked ? 'translate-x-3.5' : 'translate-x-0.5',
    md: checked ? 'translate-x-4.5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-5.5' : 'translate-x-0.5',
  };

  return (
    <div className={`flex items-start justify-between gap-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
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

      <div className="relative inline-flex items-center shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={`inline-flex items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white border ${
            trackSizes[size] || trackSizes.md
          } ${
            checked
              ? 'bg-brand-600 border-brand-600'
              : 'bg-slate-300 border-slate-300 hover:bg-slate-400'
          }`}
        >
          <span
            className={`inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
              thumbSizes[size] || thumbSizes.md
            } ${thumbTranslate[size] || thumbTranslate.md}`}
          />
        </label>
      </div>
    </div>
  );
});

export default Switch;
