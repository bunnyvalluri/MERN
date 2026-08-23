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
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4"
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-heading"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-danger-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-danger-600/15 border border-danger-500/30 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-danger-400" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1
            id="error-heading"
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
          >
            Something went wrong
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred. Our team has been notified. Please try
            reloading the page or return to the home screen.
          </p>
        </div>

        {/* Dev-only error details (never shown in production) */}
        {showDetails && error && (
          <div className="text-left p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Bug className="w-3.5 h-3.5" />
              <span>Development details</span>
            </div>
            <p className="text-xs font-mono text-rose-400 break-all">
              {error.name}: {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Reload page"
          >
            <RefreshCw className="w-4 h-4" />
            Reload page
          </button>

          <Link
            to="/"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Go to home page"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>

        {/* Brand attribution */}
        <p className="text-xs text-slate-600">InternHub Platform</p>
      </div>
    </div>
  );
}

export default ErrorFallback;
