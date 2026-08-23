import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter.jsx';

/**
 * Root application component.
 *
 * Responsibilities:
 * - Render the application router
 * - Render global providers (Toaster, etc.)
 *
 * Redux Provider is in main.jsx (wraps this component).
 */
function App() {
  return (
    <>
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
    </>
  );
}

export default App;
