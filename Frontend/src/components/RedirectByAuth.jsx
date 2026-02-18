import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Redirects "/" to /login when not authenticated, or to the role-based dashboard when authenticated.
 */
export default function RedirectByAuth() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = user?.role === 'therapist' ? '/therapist-dashboard' : '/home-dashboard';
  return <Navigate to={dashboardPath} replace />;
}
