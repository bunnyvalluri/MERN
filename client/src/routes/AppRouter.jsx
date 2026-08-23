import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/**
 * Application router.
 *
 * Route definitions are organized by role zone:
 * - Public routes (landing, auth)
 * - Student protected routes
 * - Recruiter protected routes
 * - Admin protected routes
 *
 * Protected route guards and role-based layouts will be added in Phase 3
 * when auth is implemented. For now the structure is established so that
 * future routes slot in without restructuring.
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PlaceholderPage title="InternHub — Landing" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Temporary placeholder page used during Phase 1 foundation only.
 * Replaced with real page components in Phase 3.
 */
function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
        <p className="text-slate-400 mt-2">Phase 1 foundation — UI coming in Phase 3</p>
      </div>
    </div>
  );
}

export default AppRouter;
