import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const TabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    messages: 2,
    achievements: 1,
    routines: 0
  });
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
      accessibilityHint: 'View your daily routines and progress overview'
    },
    {
      label: 'Routines',
      path: '/routine-builder',
      icon: 'Calendar',
      badge: 0,
      accessibilityHint: 'Create and manage your daily routines'
    },
    {
      label: 'Progress',
      path: '/gamification-hub',
      icon: 'Trophy',
      badge: notifications.achievements,
      accessibilityHint: 'View achievements and progress tracking'
    },
    {
      label: 'Messages',
      path: '#',
      icon: 'MessageCircle',
      badge: notifications.messages,
      accessibilityHint: 'Communication with caregivers and therapists'
    },
    {
      label: 'Settings',
      path: '/settings-accessibility',
      icon: 'Settings',
      badge: 0,
      accessibilityHint: 'Customize accessibility and app preferences'
    }
  ];

  const handleNavigation = (path, label) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  const handleKeyDown = (event, path, label) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigation(path, label);
    }
  };

  return (
    <>
      {/* Desktop Tab Navigation */}
      <nav 
        className="hidden md:block sticky top-16 z-90 bg-surface border-b border-border"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-2">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.label)}
                onKeyDown={(e) => handleKeyDown(e, item.path, item.label)}
                className={`
                  relative flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  min-w-[44px] min-h-[44px]
                  ${location.pathname === item.path
                    ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary hover:scale-102'
                  }
                  ${accessibilitySettings.reducedMotion ? 'transition-none transform-none' : ''}
                `}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                aria-label={`${item.label}. ${item.accessibilityHint}`}
                role="tab"
                tabIndex={0}
              >
                <Icon 
                  name={item.icon} 
                  size={20} 
                  className={location.pathname === item.path ? 'text-primary-foreground' : ''}
                />
                <span className="hidden lg:block">{item.label}</span>
                {item.badge > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                    aria-label={`${item.badge} ${item.label.toLowerCase()} notifications`}
                    role="status"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-100 bg-surface border-t border-border shadow-lg"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around py-2 px-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.label)}
              onKeyDown={(e) => handleKeyDown(e, item.path, item.label)}
              className={`
                relative flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                min-w-[44px] min-h-[44px] flex-1 max-w-[80px]
                ${location.pathname === item.path
                  ? 'text-primary bg-primary-50' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }
                ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
              `}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              aria-label={`${item.label}. ${item.accessibilityHint}`}
              role="tab"
              tabIndex={0}
            >
              <div className="relative">
                <Icon 
                  name={item.icon} 
                  size={22} 
                  className={location.pathname === item.path ? 'text-primary' : ''}
                />
                {item.badge > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 bg-error text-error-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
                    aria-label={`${item.badge} ${item.label.toLowerCase()} notifications`}
                    role="status"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span 
                className={`
                  text-xs font-medium leading-tight
                  ${location.pathname === item.path ? 'text-primary' : 'text-text-tertiary'}
                `}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Padding Spacer */}
      <div className="md:hidden h-20" aria-hidden="true" />
    </>
  );
};

export default TabNavigation;