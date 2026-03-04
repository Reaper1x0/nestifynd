import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user: authUser } = useAuth();
  const [userRole, setUserRole] = useState('user'); // 'user', 'therapist', 'caregiver', or 'admin'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  // Sync userRole from auth user (e.g. after login)
  useEffect(() => {
    const authRole = authUser?.role;
    if (authRole && ['user', 'therapist', 'caregiver', 'admin'].includes(authRole)) {
      setUserRole(authRole);
    }
  }, [authUser?.role]);

  useEffect(() => {
    // Load saved role from localStorage on initial load
    const savedRole = localStorage.getItem('userRole');
    if (savedRole && ['user', 'therapist', 'caregiver', 'admin'].includes(savedRole)) {
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
      '/routines',
      '/routine-builder',
      '/ai-routine',
      '/ai-chat',
      '/gamification-hub',
      '/messages',
      '/settings-accessibility'
    ],
    therapist: [
      '/therapist-dashboard',
      '/routine-builder',
      '/messages',
      '/settings-accessibility'
    ],
    caregiver: [
      '/caregiver-dashboard',
      '/messages',
      '/settings-accessibility'
    ],
    admin: [
      '/admin-dashboard',
      '/routine-builder',
      '/ai-routine',
      '/ai-chat',
      '/settings-accessibility'
    ],
    shared: [
      '/',
      '/login',
      '/login-registration',
      '/forgot-password',
      '/reset-password'
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
      const targetRoute = newRole === 'admin' ? '/admin-dashboard'
        : newRole === 'therapist' ? '/therapist-dashboard' 
        : newRole === 'caregiver' ? '/caregiver-dashboard' 
        : '/home-dashboard';
      
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
    if (roleRoutes[userRole]?.includes(path) || roleRoutes.shared?.includes(path)) return true;
    if (userRole === 'user' && path.startsWith('/routines/')) return true; // routine detail view
    return false;
  }, [userRole]);

  // Redirect if current route is not accessible
  useEffect(() => {
    if (!isRouteAccessible(location.pathname)) {
      const defaultRoute = userRole === 'admin' ? '/admin-dashboard'
        : userRole === 'therapist' ? '/therapist-dashboard' 
        : userRole === 'caregiver' ? '/caregiver-dashboard' 
        : '/home-dashboard';
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
          path: '/routines',
          icon: 'Calendar',
          description: 'Create and manage routines'
        },
        {
          label: 'AI Routine',
          path: '/ai-routine',
          icon: 'Sparkles',
          description: 'Generate a routine from a short Q&A'
        },
        {
          label: 'AI Assistant',
          path: '/ai-chat',
          icon: 'Bot',
          description: 'Chat for routine setup and productivity tips'
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
      ],
      caregiver: [
        {
          label: 'Dashboard',
          path: '/caregiver-dashboard',
          icon: 'Heart',
          description: 'View assigned users and provide support'
        },
        {
          label: 'Messages',
          path: '/messages',
          icon: 'MessageCircle',
          description: 'Communicate with your assigned users'
        },
        {
          label: 'Settings',
          path: '/settings-accessibility',
          icon: 'Settings',
          description: 'Configure system preferences'
        }
      ],
      admin: [
        {
          label: 'Admin Dashboard',
          path: '/admin-dashboard',
          icon: 'Shield',
          description: 'Manage users, plans, assignments, and reports'
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
          aria-label={`Current view: ${userRole === 'admin' ? 'Admin Dashboard' : userRole === 'therapist' ? 'Therapist Dashboard' : userRole === 'caregiver' ? 'Caregiver Dashboard' : 'User Dashboard'}`}
        >
          {isTransitioning ? 'Switching views...' : `Viewing as ${userRole}`}
        </div>
      </div>
    </RoleContext.Provider>
  );
};

export default RoleBasedRouter;