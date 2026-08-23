import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from 'react-redux';
import AppRouter from './routes/AppRouter.jsx';
import { GlobalErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { NetworkStatusBanner } from './components/common/NetworkStatusBanner.jsx';
import { injectStore } from './lib/axios.js';

/**
 * Root application component.
 *
 * Responsibilities:
 * - Wrap routing in GlobalErrorBoundary (catches unhandled render errors)
 * - Render NetworkStatusBanner (offline/online detection)
 * - Render global providers (Toaster)
 * - Inject Redux store into Axios client (enables offline + logout dispatching)
 *
 * Redux Provider and HelmetProvider are in main.jsx (wrap this component).
 */
function App() {
  const store = useStore();

  // Inject Redux store into Axios client once on mount.
  // This allows the Axios interceptor to dispatch setOffline() and auth/clearAuth
  // without creating a circular import.
  useEffect(() => {
    injectStore(store);
  }, [store]);

  return (
    <GlobalErrorBoundary>
      {/* Offline detection banner — sits above all content */}
      <NetworkStatusBanner />

      <AppRouter />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </GlobalErrorBoundary>
  );
}

export default App;
