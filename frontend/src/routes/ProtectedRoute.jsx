import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser, loginUser } from '../features/auth/authSlice.js';
import { Spinner, Button } from '../components/ui/index.js';
import { ShieldAlert, ArrowRight, Home, LayoutDashboard, UserCheck } from 'lucide-react';

/**
 * Route protection wrapper enforcing authentication and role-based access control (RBAC).
 */
export function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, role, token, loading } = useSelector((state) => state.auth);

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
      const targetRole = allowedRoles[0]; // 'ADMIN' | 'RECRUITER' | 'STUDENT'
      const demoEmail =
        targetRole === 'ADMIN'
          ? 'admin@internhub.dev'
          : targetRole === 'RECRUITER'
          ? 'recruiter@stripe.com'
          : 'student@internhub.dev';
      const demoPass =
        targetRole === 'ADMIN'
          ? 'Admin123!'
          : targetRole === 'RECRUITER'
          ? 'Recruiter123!'
          : 'Student123!';

      const userDashboardPath =
        currentRole === 'RECRUITER'
          ? '/recruiter'
          : currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN'
          ? '/admin'
          : '/student';

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center selection:bg-rose-500/20">
          <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl text-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                403 — Access Forbidden
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You are currently signed in as{' '}
                <strong className="text-slate-900 font-mono font-bold">[{currentRole}]</strong>
                {user?.name ? ` (${user.name})` : ''}, which does not have authorization for this portal route.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              {/* Primary Option: Go to own authorized dashboard */}
              <Button
                variant="primary"
                size="sm"
                className="w-full font-bold shadow-xs"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
                onClick={() => navigate(userDashboardPath)}
              >
                Go to My {currentRole} Dashboard
              </Button>

              {/* Secondary Option: Switch demo account to target role */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={async () => {
                  await dispatch(loginUser({ email: demoEmail, password: demoPass }));
                }}
              >
                Switch to {targetRole} Demo Account
              </Button>

              <a
                href="/"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Home
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}

export default ProtectedRoute;
