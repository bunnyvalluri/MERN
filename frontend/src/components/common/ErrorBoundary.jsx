import React from 'react';
import ErrorFallback from './ErrorFallback.jsx';

/**
 * GlobalErrorBoundary — Class-based React Error Boundary.
 *
 * Catches any unhandled render/lifecycle errors in the component tree below it.
 * Renders ErrorFallback instead of a blank screen or cryptic crash.
 *
 * Placed at the root of the application (wraps AppRouter in App.jsx).
 *
 * Usage:
 *   <GlobalErrorBoundary>
 *     <App />
 *   </GlobalErrorBoundary>
 *
 * Or with a custom fallback:
 *   <GlobalErrorBoundary fallback={<MyErrorPage />}>
 *     <App />
 *   </GlobalErrorBoundary>
 */
export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
    this.resetError = this.resetError.bind(this);
  }

  /**
   * Update state so the next render shows the fallback UI.
   * Called during the render phase so side effects are not allowed here.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Log the caught error for observability.
   * This is a lifecycle method — it's safe to perform side effects here.
   */
  componentDidCatch(error, errorInfo) {
    // Log to console in development for quick debugging
    if (import.meta.env.DEV) {
      console.group('[ErrorBoundary] Caught unhandled render error');
      console.error('Error:', error);
      console.error('Component stack:', errorInfo?.componentStack);
      console.groupEnd();
    }

    // In production, send to a monitoring endpoint (Sentry, Datadog, etc.)
    // Replace with your actual error reporting service:
    // if (import.meta.env.PROD) {
    //   reportError(error, { extra: errorInfo });
    // }
  }

  /**
   * Reset the error boundary state so users can retry.
   * Call this after navigation or explicit user action.
   */
  resetError() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use a custom fallback if provided, otherwise use the default ErrorFallback
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, onReset: this.resetError })
          : fallback;
      }

      return (
        <ErrorFallback
          error={error}
          onReset={this.resetError}
        />
      );
    }

    return children;
  }
}

export default GlobalErrorBoundary;
