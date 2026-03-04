import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useRole } from './RoleBasedRouter';
import { useAuth } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useRole();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    messages: 0,
    achievements: 0,
    routines: 0
  });

  const fetchNotificationCounts = () => {
    if (!user) return;
    axiosClient.get('/api/notifications/counts').then((res) => {
      if (res.data) {
        setNotifications({
          messages: res.data.messages ?? 0,
          achievements: res.data.achievements ?? 0,
          routines: res.data.routines ?? 0
        });
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchNotificationCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  useEffect(() => {
    // Check for accessibility preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setAccessibilitySettings(prev => ({
      ...prev,
      reducedMotion,
      highContrast
    }));
  }, []);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/home-dashboard',
      icon: 'Home',
      badge: notifications.routines,
      roleRequired: 'user'
    },
    {
      label: 'Routines',
      path: '/routines',
      icon: 'Calendar',
      badge: 0,
      roleRequired: 'user'
    },
    {
      label: 'AI Routine',
      path: '/ai-routine',
      icon: 'Sparkles',
      badge: 0,
      roleRequired: 'user'
    },
    {
      label: 'AI Assistant',
      path: '/ai-chat',
      icon: 'Bot',
      badge: 0,
      roleRequired: 'user'
    },
    {
      label: 'Progress',
      path: '/gamification-hub',
      icon: 'Trophy',
      badge: notifications.achievements,
      roleRequired: 'user'
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: 'MessageCircle',
      badge: notifications.messages,
      roleRequired: 'user'
    },
    {
      label: 'Settings',
      path: '/settings-accessibility',
      icon: 'Settings',
      badge: 0,
      roleRequired: 'user'
    },
    {
      label: 'Therapist Dashboard',
      path: '/therapist-dashboard',
      icon: 'Activity',
      badge: 0,
      roleRequired: 'therapist'
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: 'MessageCircle',
      badge: notifications.messages,
      roleRequired: 'therapist'
    },
    {
      label: 'Settings',
      path: '/settings-accessibility',
      icon: 'Settings',
      badge: 0,
      roleRequired: 'therapist'
    },
    {
      label: 'Dashboard',
      path: '/caregiver-dashboard',
      icon: 'Heart',
      badge: 0,
      roleRequired: 'caregiver'
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: 'MessageCircle',
      badge: notifications.messages,
      roleRequired: 'caregiver'
    },
    {
      label: 'Settings',
      path: '/settings-accessibility',
      icon: 'Settings',
      badge: 0,
      roleRequired: 'caregiver'
    },
    {
      label: 'Admin Dashboard',
      path: '/admin-dashboard',
      icon: 'Shield',
      badge: 0,
      roleRequired: 'admin'
    },
    {
      label: 'Settings',
      path: '/settings-accessibility',
      icon: 'Settings',
      badge: 0,
      roleRequired: 'admin'
    }
  ];

  const handleNavigation = (path) => {
    if (path !== '#') {
      navigate(path);
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.roleRequired || item.roleRequired === userRole
  );

  const currentItem = navigationItems.find(item => item.path === location.pathname);

  return (
    <header 
      className="sticky top-0 z-100 bg-surface border-b border-border shadow-sm"
      role="banner"
    >
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(
                userRole === 'admin' ? '/admin-dashboard'
                : userRole === 'therapist' ? '/therapist-dashboard' 
                : userRole === 'caregiver' ? '/caregiver-dashboard' 
                : '/home-dashboard'
              )}
              className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
              aria-label="NestifyND Home"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-foreground"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-text-primary hidden sm:block">
                NestifyND
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3" role="navigation">
            {filteredNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                  ${location.pathname === item.path
                    ? 'bg-primary-50 text-primary border border-primary-200' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }
                `}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span 
                    className="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-semibold"
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* User label (desktop) */}
            {user && (
              <span className="hidden sm:block text-sm text-text-secondary truncate max-w-[120px]" title={user.email}>
                {user.name || user.email}
              </span>
            )}
            {/* Logout */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hidden sm:flex"
              iconName="LogOut"
              iconPosition="left"
            >
              Log out
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <Icon name={isMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div 
            className="md:hidden py-4 border-t border-border animate-fade-in"
            role="navigation"
          >
            <div className="space-y-2">
              {filteredNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    relative flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left
                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                    ${location.pathname === item.path
                      ? 'bg-primary-50 text-primary border border-primary-200' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                    }
                  `}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span 
                      className="ml-auto bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      aria-label={`${item.badge} notifications`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
              
              {/* Mobile Logout */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-error hover:text-error hover:bg-error-50"
                  iconName="LogOut"
                  iconPosition="left"
                >
                  Log out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skip Link for Screen Readers */}
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={(e) => e.target.style.top = '6px'}
        onBlur={(e) => e.target.style.top = '-40px'}
      >
        Skip to main content
      </a>
    </header>
  );
};

export default Header;