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

// Recruiter Feature Pages
import RecruiterDashboard from '../features/recruiter/pages/RecruiterDashboard.jsx';
import RecruiterInternshipsPage from '../features/recruiter/pages/RecruiterInternshipsPage.jsx';
import CreateInternshipPage from '../features/recruiter/pages/CreateInternshipPage.jsx';
import EditInternshipPage from '../features/recruiter/pages/EditInternshipPage.jsx';
import CompanyProfilePage from '../features/recruiter/pages/CompanyProfilePage.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

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

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
