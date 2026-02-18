import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Create Role Context
const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleBasedRouter');
  }
  return context;
};

const RoleBasedRouter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('user'); // 'user' or 'therapist'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  useEffect(() => {
    // Load saved role from localStorage
    const savedRole = localStorage.getItem('userRole');
    if (savedRole && (savedRole === 'user' || savedRole === 'therapist')) {
      setUserRole(savedRole);
    }

    // Check for accessibility preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setAccessibilitySettings(prev => ({
      ...prev,
      reducedMotion,
      highContrast
    }));
  }, []);

  // Role-based route definitions
  const roleRoutes = {
    user: [
      '/home-dashboard',
      '/routine-builder',
      '/gamification-hub',
      '/settings-accessibility'
    ],
    therapist: [
      '/therapist-dashboard',
      '/settings-accessibility'
    ],
    shared: [
      '/',
      '/login',
      '/login-registration',
      '/forgot-password'
    ]
  };

  const handleRoleSwitch = async (newRole) => {
    if (newRole === userRole) return;

    setIsTransitioning(true);
    
    try {
      // Save role preference
      localStorage.setItem('userRole', newRole);
      setUserRole(newRole);

      // Navigate to appropriate dashboard
      const targetRoute = newRole === 'therapist' ? '/therapist-dashboard' : '/home-dashboard';
      
      // Add slight delay for smooth transition if animations are enabled
      if (!accessibilitySettings.reducedMotion) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      navigate(targetRoute);
    } catch (error) {
      console.error('Role switch failed:', error);
      // Revert role on error
      setUserRole(userRole);
    } finally {
      setIsTransitioning(false);
    }
  };

  // Check if current route is accessible for current role
  const isRouteAccessible = useCallback((path) => {
    return roleRoutes[userRole].includes(path) || roleRoutes.shared.includes(path);
  }, [userRole]);

  // Redirect if current route is not accessible
  useEffect(() => {
    if (!isRouteAccessible(location.pathname)) {
      const defaultRoute = userRole === 'therapist' ? '/therapist-dashboard' : '/home-dashboard';
      navigate(defaultRoute, { replace: true });
    }
  }, [userRole, location.pathname, navigate, isRouteAccessible]);

  // Get navigation items based on role
  const getNavigationItems = () => {
    const baseItems = {
      user: [
        {
          label: 'Dashboard',
          path: '/home-dashboard',
          icon: 'Home',
          description: 'View your daily routines and progress'
        },
        {
          label: 'Routines',
          path: '/routine-builder',
          icon: 'Calendar',
          description: 'Create and manage routines'
        },
        {
          label: 'Progress',
          path: '/gamification-hub',
          icon: 'Trophy',
          description: 'Track achievements and progress'
        },
        {
          label: 'Settings',
          path: '/settings-accessibility',
          icon: 'Settings',
          description: 'Customize accessibility preferences'
        }
      ],
      therapist: [
        {
          label: 'Clinical Dashboard',
          path: '/therapist-dashboard',
          icon: 'Activity',
          description: 'Monitor client progress and analytics'
        },
        {
          label: 'Settings',
          path: '/settings-accessibility',
          icon: 'Settings',
          description: 'Configure system preferences'
        }
      ]
    };

    return baseItems[userRole] || [];
  };

  const contextValue = {
    userRole,
    setUserRole: handleRoleSwitch,
    isTransitioning,
    navigationItems: getNavigationItems(),
    isRouteAccessible,
    accessibilitySettings
  };

  return (
    <RoleContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        <div
          className={`
            transition-opacity duration-200
            ${isTransitioning ? 'opacity-50' : 'opacity-100'}
            ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
          `}
        >
          {children}
        </div>

        {/* Role indicator for screen readers */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-label={`Current view: ${userRole === 'therapist' ? 'Therapist Dashboard' : 'User Dashboard'}`}
        >
          {isTransitioning ? 'Switching views...' : `Viewing as ${userRole}`}
        </div>
      </div>
    </RoleContext.Provider>
  );
};

export default RoleBasedRouter;