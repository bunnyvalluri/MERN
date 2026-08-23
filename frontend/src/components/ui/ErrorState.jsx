import React, { useState } from 'react';
import { AlertOctagon, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Premium SaaS Error State & Error Boundary View.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again or contact support if the issue persists.',
  error,
  onRetry,
  primaryAction,
  secondaryAction,
  className = '',
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      role="alert"
      className={`rounded-2xl border border-danger-200 bg-danger-50/50 p-8 sm:p-12 flex flex-col items-center justify-center text-center animate-fade-in ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-danger-100 border border-danger-200 flex items-center justify-center text-danger-600 mb-4">
        <AlertOctagon className="w-6 h-6" />
      </div>

      <h4 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
        {title}
      </h4>

      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md leading-relaxed">
        {message}
      </p>

      {error && (
        <div className="mt-4 w-full max-w-lg text-left">
          <button
            type="button"
            onClick={() => setShowDetails((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mx-auto"
          >
            <span>{showDetails ? 'Hide error details' : 'Show error details'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <pre className="mt-3 p-3 rounded-lg bg-white border border-danger-200 text-[11px] font-mono text-danger-700 overflow-x-auto whitespace-pre-wrap max-h-40 shadow-sm">
              {error.stack || error.message || String(error)}
            </pre>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        )}
        {primaryAction}
        {secondaryAction}
      </div>
    </div>
  );
}

export default ErrorState;
