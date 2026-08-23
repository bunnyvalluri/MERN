import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import DesignSystemShowcase from '../pages/DesignSystemShowcase.jsx';

/**
 * Application Router.
 *
 * Routes:
 * - `/` -> Production Landing Page
 * - `/design-system` -> Design System Component Showcase
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Internal Design System Showcase */}
        <Route path="/design-system" element={<DesignSystemShowcase />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
