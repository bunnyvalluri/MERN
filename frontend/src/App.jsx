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
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#6366f1', secondary: '#f1f5f9' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
          },
        }}
      />
    </GlobalErrorBoundary>
  );
}

export default App;
