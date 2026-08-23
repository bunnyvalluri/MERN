import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * ErrorFallback — Full-page error UI displayed by ErrorBoundary.
 *
 * Design consistent with InternHub dark theme.
 * Never shows stack traces or raw error objects in the UI.
 *
 * @param {object}   props
 * @param {Error}    props.error           - The caught error (optional)
 * @param {Function} props.onReset         - Callback to reset the error boundary
 * @param {boolean}  [props.showDetails]   - Show dev-only error name (never stack)
 */
export function ErrorFallback({ error, onReset, showDetails = import.meta.env.DEV }) {
  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center px-4"
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-heading"
    >
      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-danger-100 border border-danger-200 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-danger-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1
            id="error-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
          >
            Something went wrong
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred. Our team has been notified. Please try
            reloading the page or return to the home screen.
          </p>
        </div>

        {/* Dev-only error details (never shown in production) */}
        {showDetails && error && (
          <div className="text-left p-4 rounded-xl bg-white border border-danger-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
              <Bug className="w-3.5 h-3.5" />
              <span>Development details</span>
            </div>
            <p className="text-xs font-mono text-danger-600 break-all">
              {error.name}: {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-white shadow-sm"
            aria-label="Reload page"
          >
            <RefreshCw className="w-4 h-4" />
            Reload page
          </button>

          <Link
            to="/"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white shadow-sm"
            aria-label="Go to home page"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>

        {/* Brand attribution */}
        <p className="text-xs text-slate-500">InternHub Platform</p>
      </div>
    </div>
  );
}

export default ErrorFallback;
