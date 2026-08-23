import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from 'react-redux';
import AppRouter from './routes/AppRouter.jsx';
import { GlobalErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { injectStore } from './lib/axios.js';

/**
 * Root application component.
 * Clean, distraction-free view with error boundaries and toast notifications.
 */
function App() {
  const store = useStore();

  useEffect(() => {
    injectStore(store);
  }, [store]);

  return (
    <GlobalErrorBoundary>
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
