import React, { useState } from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

/**
 * Premium SaaS Alert & Banner Component.
 */
export function Alert({
  variant = 'info',
  title,
  description,
  icon: customIcon,
  dismissible = false,
  onDismiss,
  action,
  className = '',
  children,
  ...props
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  const variantStyles = {
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-900',
      iconColor: 'text-sky-600',
      titleColor: 'text-sky-950',
      defaultIcon: <Info className="w-5 h-5" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-950',
      defaultIcon: <CheckCircle2 className="w-5 h-5" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-950',
      defaultIcon: <AlertTriangle className="w-5 h-5" />,
    },
    danger: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      iconColor: 'text-rose-600',
      titleColor: 'text-rose-950',
      defaultIcon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.info;
  const icon = customIcon !== undefined ? customIcon : currentVariant.defaultIcon;

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 flex items-start gap-3.5 animate-fade-in ${currentVariant.container} ${className}`}
      {...props}
    >
      {icon && (
        <div className={`shrink-0 mt-0.5 ${currentVariant.iconColor}`}>
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0 text-xs sm:text-sm">
        {title && (
          <h5 className={`font-semibold tracking-tight ${currentVariant.titleColor}`}>
            {title}
          </h5>
        )}
        {(description || children) && (
          <div className={`mt-0.5 leading-relaxed opacity-90 ${title ? 'mt-1' : ''}`}>
            {description || children}
          </div>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
