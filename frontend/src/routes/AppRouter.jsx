import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { Spinner } from '../components/ui/index.js';
import SEOHead from '../components/common/SEOHead.jsx';

// Eagerly loaded public entry point
import LandingPage from '../pages/LandingPage.jsx';

// ─── Code-Split Lazy Loaded Route Components ─────────────────────────────────
const InternshipsPage = lazy(() => import('../features/internships/pages/InternshipsPage.jsx'));
const InternshipDetailPage = lazy(() => import('../features/internships/pages/InternshipDetailPage.jsx'));
const CompaniesPage = lazy(() => import('../features/companies/pages/CompaniesPage.jsx'));
const CompanyDetailPage = lazy(() => import('../features/companies/pages/CompanyDetailPage.jsx'));

// Authentication Pages
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage.jsx'));
const VerifyEmailPage = lazy(() => import('../features/auth/pages/VerifyEmailPage.jsx'));

// Student Pages
const StudentDashboard = lazy(() => import('../features/student/pages/StudentDashboard.jsx'));
const StudentProfilePage = lazy(() => import('../features/student/pages/StudentProfilePage.jsx'));
const StudentResumePage = lazy(() => import('../features/student/pages/StudentResumePage.jsx'));
const StudentSettingsPage = lazy(() => import('../features/student/pages/StudentSettingsPage.jsx'));
const StudentApplicationsPage = lazy(() => import('../features/applications/pages/StudentApplicationsPage.jsx'));
const StudentApplicationDetailPage = lazy(() => import('../features/applications/pages/StudentApplicationDetailPage.jsx'));
const StudentInterviewsPage = lazy(() => import('../features/interviews/pages/StudentInterviewsPage.jsx'));

// Recruiter Pages
const RecruiterDashboard = lazy(() => import('../features/recruiter/pages/RecruiterDashboard.jsx'));
const RecruiterInternshipsPage = lazy(() => import('../features/recruiter/pages/RecruiterInternshipsPage.jsx'));
const CreateInternshipPage = lazy(() => import('../features/recruiter/pages/CreateInternshipPage.jsx'));
const EditInternshipPage = lazy(() => import('../features/recruiter/pages/EditInternshipPage.jsx'));
const CompanyProfilePage = lazy(() => import('../features/recruiter/pages/CompanyProfilePage.jsx'));
const RecruiterApplicationsPage = lazy(() => import('../features/applications/pages/RecruiterApplicationsPage.jsx'));
const CandidateDetailPage = lazy(() => import('../features/applications/pages/CandidateDetailPage.jsx'));

// Admin & Notifications Pages
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboard.jsx'));
const NotificationCenterPage = lazy(() => import('../features/notifications/pages/NotificationCenterPage.jsx'));

/**
 * Route Loading Fallback Skeleton.
 */
function RouteLoadingFallback() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-600">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
      <p className="text-xs font-mono text-slate-500 animate-pulse">Loading module...</p>
    </div>
  );
}

/**
 * Central Application Router with route-level code splitting.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Public Discovery Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/internships/:id" element={<InternshipDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />

          {/* Global Protected Notifications Hub */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <NotificationCenterPage />
              </ProtectedRoute>
            }
          />

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
            path="/student/applications"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
                <StudentApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
                <StudentApplicationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/interviews"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
                <StudentInterviewsPage />
              </ProtectedRoute>
            }
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
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/dashboard"
            element={<Navigate to="/recruiter" replace />}
          />
          <Route
            path="/recruiter/applications"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <RecruiterApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <CandidateDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/internships"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <RecruiterInternshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/internships/new"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <CreateInternshipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/internships/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <EditInternshipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/company"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN', 'SUPER_ADMIN']}>
                <CompanyProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
