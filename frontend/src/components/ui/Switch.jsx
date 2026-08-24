import React, { forwardRef, useId } from 'react';

/**
 * Accessible SaaS Toggle Switch Component with Smooth Hardware-Accelerated Thumb Animation.
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
    sm: 'w-8 h-4 p-0.5',
    md: 'w-11 h-6 p-0.5',
    lg: 'w-14 h-7.5 p-0.5',
  };

  const thumbSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6.5 h-6.5',
  };

  const thumbTranslate = {
    sm: checked ? 'translate-x-4' : 'translate-x-0',
    md: checked ? 'translate-x-5' : 'translate-x-0',
    lg: checked ? 'translate-x-6.5' : 'translate-x-0',
  };

  const handleChange = (e) => {
    if (disabled) return;
    if (onChange) {
      // Support both event signature and direct boolean callback
      if (typeof e?.target?.checked === 'boolean') {
        onChange(e.target.checked, e);
      } else {
        onChange(!checked);
      }
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || description) && (
        <div className="text-xs select-none">
          {label && (
            <label
              htmlFor={id}
              className="font-semibold text-slate-800 cursor-pointer block leading-tight"
            >
              {label}
            </label>
          )}
          {description && <p className="text-slate-500 mt-0.5 text-[11px] leading-tight">{description}</p>}
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
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleChange}
          className={`inline-flex items-center rounded-full transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 border ${
            trackSizes[size] || trackSizes.md
          } ${
            checked
              ? 'bg-brand-600 border-brand-600 shadow-xs'
              : 'bg-slate-200 border-slate-300 hover:bg-slate-300'
          }`}
        >
          <span
            className={`inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out pointer-events-none ring-1 ring-black/5 ${
              thumbSizes[size] || thumbSizes.md
            } ${thumbTranslate[size] || thumbTranslate.md}`}
          />
        </button>
      </div>
    </div>
  );
});

export default Switch;
