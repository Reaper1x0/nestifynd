import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import RoleBasedRouter from "components/ui/RoleBasedRouter";
import AccessibilityNavWrapper from "components/ui/AccessibilityNavWrapper";
import ProtectedRoute from "components/ProtectedRoute";
import RedirectByAuth from "components/RedirectByAuth";
import LoginRegistration from "pages/login-registration";
import ForgotPassword from "pages/forgot-password";
import ResetPassword from "pages/reset-password";
import HomeDashboard from "pages/home-dashboard";
import SettingsAccessibility from "pages/settings-accessibility";
import TherapistDashboard from "pages/therapist-dashboard";
import CaregiverDashboard from "pages/caregiver-dashboard";
import AdminDashboard from "pages/admin-dashboard";
import GamificationHub from "pages/gamification-hub";
import RoutineBuilder from "pages/routine-builder";
import RoutinesList from "pages/routines-list";
import RoutineDetail from "pages/routine-detail";
import Messages from "pages/messages";
import AIRoutine from "pages/ai-routine";
import AIChat from "pages/ai-chat";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
          <RoleBasedRouter>
            <ScrollToTop />
            <RouterRoutes>
              <Route path="/" element={<RedirectByAuth />} />
              <Route path="/login" element={<LoginRegistration />} />
              <Route path="/login-registration" element={<LoginRegistration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/home-dashboard" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
              <Route path="/therapist-dashboard" element={<ProtectedRoute><AccessibilityNavWrapper><TherapistDashboard /></AccessibilityNavWrapper></ProtectedRoute>} />
              <Route path="/caregiver-dashboard" element={<ProtectedRoute><CaregiverDashboard /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><AccessibilityNavWrapper><AdminDashboard /></AccessibilityNavWrapper></ProtectedRoute>} />
              <Route path="/settings-accessibility" element={<ProtectedRoute><SettingsAccessibility /></ProtectedRoute>} />
              <Route path="/gamification-hub" element={<ProtectedRoute><GamificationHub /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/routines" element={<ProtectedRoute><RoutinesList /></ProtectedRoute>} />
              <Route path="/routines/:id" element={<ProtectedRoute><RoutineDetail /></ProtectedRoute>} />
              <Route path="/routine-builder" element={<ProtectedRoute><RoutineBuilder /></ProtectedRoute>} />
              <Route path="/ai-routine" element={<ProtectedRoute><AIRoutine /></ProtectedRoute>} />
              <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </RouterRoutes>
          </RoleBasedRouter>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;