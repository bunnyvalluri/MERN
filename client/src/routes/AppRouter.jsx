import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import DesignSystemShowcase from '../pages/DesignSystemShowcase.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage.jsx';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage.jsx';

// Discovery & Internships Pages
import InternshipsPage from '../features/internships/pages/InternshipsPage.jsx';
import InternshipDetailPage from '../features/internships/pages/InternshipDetailPage.jsx';

// Student Feature Pages
import StudentDashboard from '../features/student/pages/StudentDashboard.jsx';
import StudentProfilePage from '../features/student/pages/StudentProfilePage.jsx';
import StudentResumePage from '../features/student/pages/StudentResumePage.jsx';
import StudentSettingsPage from '../features/student/pages/StudentSettingsPage.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';
import { Button, Card, CardTitle, CardContent, Badge } from '../components/ui/index.js';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice.js';
import { LogOut, Building2 } from 'lucide-react';

/**
 * Placeholder view for authenticated Recruiter Dashboard (built in next phase).
 */
function RecruiterDashboardPlaceholder() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900 p-6 space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <Badge variant="success" size="sm">
            Recruiter Portal
          </Badge>
          <CardTitle>Welcome, {user?.name || 'Recruiter'}!</CardTitle>
          <p className="text-xs text-slate-400">
            Authenticated via JWT • Role: <span className="font-mono text-emerald-300">{user?.role}</span>
          </p>
        </div>
        <CardContent className="p-0 space-y-2 text-xs text-slate-300 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div>Email: <span className="font-semibold text-white">{user?.email}</span></div>
          <div>Company Hiring Pipeline: <span className="font-semibold text-white">Active</span></div>
        </CardContent>
        <div className="flex gap-3">
          <a
            href="/"
            className="flex-1 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center"
          >
            Home Page
          </a>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            onClick={() => dispatch(logoutUser())}
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Central Application Router.
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Discovery Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/internships/:id" element={<InternshipDetailPage />} />
        <Route path="/design-system" element={<DesignSystemShowcase />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Protected Student Portal Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={<Navigate to="/student" replace />}
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resume"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
              <StudentResumePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
              <StudentSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Recruiter Portal Routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
              <RecruiterDashboardPlaceholder />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
