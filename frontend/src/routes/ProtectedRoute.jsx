import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../features/auth/authSlice.js';
import { Spinner } from '../components/ui/index.js';

/**
 * Route protection wrapper enforcing authentication and role-based access control (RBAC).
 *
 * @param {object} props
 * @param {Array<string>} [props.allowedRoles] - Roles allowed to access the route ('STUDENT', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN')
 * @param {React.ReactNode} props.children
 */
export function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, role, token, loading } = useSelector((state) => state.auth);

  // If token is present but user profile is not yet hydrated, fetch current user
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-xs font-mono text-slate-500">Verifying session...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && user) {
    const currentRole = role || user.role;
    if (!allowedRoles.includes(currentRole)) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">403 — Access Forbidden</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your account ({currentRole}) does not have permission to access this portal.
            </p>
            <a
              href="/"
              className="inline-flex px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              Return to Home
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
}

export default ProtectedRoute;
