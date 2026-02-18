import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import RoleBasedRouter from "components/ui/RoleBasedRouter";
import ProtectedRoute from "components/ProtectedRoute";
import RedirectByAuth from "components/RedirectByAuth";
import LoginRegistration from "pages/login-registration";
import ForgotPassword from "pages/forgot-password";
import HomeDashboard from "pages/home-dashboard";
import SettingsAccessibility from "pages/settings-accessibility";
import TherapistDashboard from "pages/therapist-dashboard";
import GamificationHub from "pages/gamification-hub";
import RoutineBuilder from "pages/routine-builder";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <RoleBasedRouter>
            <ScrollToTop />
            <RouterRoutes>
              <Route path="/" element={<RedirectByAuth />} />
              <Route path="/login" element={<LoginRegistration />} />
              <Route path="/login-registration" element={<LoginRegistration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/home-dashboard" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
              <Route path="/therapist-dashboard" element={<ProtectedRoute><TherapistDashboard /></ProtectedRoute>} />
              <Route path="/settings-accessibility" element={<ProtectedRoute><SettingsAccessibility /></ProtectedRoute>} />
              <Route path="/gamification-hub" element={<ProtectedRoute><GamificationHub /></ProtectedRoute>} />
              <Route path="/routine-builder" element={<ProtectedRoute><RoutineBuilder /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </RouterRoutes>
          </RoleBasedRouter>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;