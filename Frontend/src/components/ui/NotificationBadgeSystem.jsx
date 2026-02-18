import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';


// Create Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationBadgeSystem');
  }
  return context;
};

const NotificationBadgeSystem = ({ children }) => {
  const [notifications, setNotifications] = useState({
    messages: 0,
    achievements: 0,
    routines: 0,
    reminders: 0,
    system: 0
  });

  const [notificationSettings, setNotificationSettings] = useState({
    showBadges: true,
    showToasts: true,
    soundEnabled: false,
    maxBadgeCount: 99,
    groupSimilar: true,
    respectQuietHours: true
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    screenReader: false
  });

  // Load saved notification preferences
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }

    // Check accessibility preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setAccessibilitySettings({
      reducedMotion,
      highContrast,
      screenReader: window.navigator.userAgent.includes('NVDA') || 
                   window.navigator.userAgent.includes('JAWS') ||
                   window.speechSynthesis !== undefined
    });
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Simulate real-time notification updates
  useEffect(() => {
    // Mock data - in real app this would come from API/WebSocket
    const mockNotifications = {
      messages: 2,
      achievements: 1,
      routines: 0,
      reminders: 3,
      system: 0
    };
    
    setNotifications(mockNotifications);
  }, []);

  const updateNotificationCount = useCallback((type, count) => {
    setNotifications(prev => ({
      ...prev,
      [type]: Math.max(0, count)
    }));

    // Announce to screen readers if enabled
    if (accessibilitySettings.screenReader && count > 0) {
      const announcement = `${count} new ${type} notification${count === 1 ? '' : 's'}`;
      announceToScreenReader(announcement);
    }
  }, [accessibilitySettings.screenReader]);

  const incrementNotification = useCallback((type, amount = 1) => {
    setNotifications(prev => ({
      ...prev,
      [type]: prev[type] + amount
    }));
  }, []);

  const clearNotifications = useCallback((type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: 0
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications({
      messages: 0,
      achievements: 0,
      routines: 0,
      reminders: 0,
      system: 0
    });
  }, []);

  const getTotalNotifications = useCallback(() => {
    return Object.values(notifications).reduce((sum, count) => sum + count, 0);
  }, [notifications]);

  const announceToScreenReader = (message) => {
    const announcement = document.getElementById('notification-announcements');
    if (announcement) {
      announcement.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        announcement.textContent = '';
      }, 1000);
    }
  };

  const updateNotificationSettings = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Badge component
  const NotificationBadge = ({ 
    count, 
    type = 'default',
    size = 'sm',
    position = 'top-right',
    showZero = false,
    maxCount = notificationSettings.maxBadgeCount,
    className = '',
    ariaLabel
  }) => {
    if (!notificationSettings.showBadges || (!showZero && count === 0)) {
      return null;
    }

    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
    
    const sizeClasses = {
      xs: 'w-3 h-3 text-xs',
      sm: 'w-5 h-5 text-xs',
      md: 'w-6 h-6 text-sm',
      lg: 'w-7 h-7 text-sm'
    };

    const positionClasses = {
      'top-right': '-top-1 -right-1',
      'top-left': '-top-1 -left-1',
      'bottom-right': '-bottom-1 -right-1',
      'bottom-left': '-bottom-1 -left-1'
    };

    const typeClasses = {
      default: 'bg-error text-error-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      info: 'bg-primary text-primary-foreground'
    };

    return (
      <span
        className={`
          absolute ${positionClasses[position]} ${sizeClasses[size]} ${typeClasses[type]}
          rounded-full flex items-center justify-center font-medium
          ${!accessibilitySettings.reducedMotion ? 'animate-scale-in' : ''}
          ${accessibilitySettings.highContrast ? 'border-2 border-current' : ''}
          ${className}
        `}
        role="status"
        aria-label={ariaLabel || `${count} notifications`}
      >
        {displayCount}
      </span>
    );
  };

  // Notification dot component (for subtle indicators)
  const NotificationDot = ({ 
    show, 
    type = 'default',
    size = 'sm',
    position = 'top-right',
    className = ''
  }) => {
    if (!notificationSettings.showBadges || !show) {
      return null;
    }

    const sizeClasses = {
      xs: 'w-2 h-2',
      sm: 'w-3 h-3',
      md: 'w-4 h-4'
    };

    const positionClasses = {
      'top-right': '-top-1 -right-1',
      'top-left': '-top-1 -left-1',
      'bottom-right': '-bottom-1 -right-1',
      'bottom-left': '-bottom-1 -left-1'
    };

    const typeClasses = {
      default: 'bg-error',
      success: 'bg-success',
      warning: 'bg-warning',
      info: 'bg-primary'
    };

    return (
      <span
        className={`
          absolute ${positionClasses[position]} ${sizeClasses[size]} ${typeClasses[type]}
          rounded-full
          ${!accessibilitySettings.reducedMotion ? 'animate-pulse' : ''}
          ${className}
        `}
        role="status"
        aria-label="New notification available"
      />
    );
  };

  const contextValue = {
    notifications,
    notificationSettings,
    updateNotificationCount,
    incrementNotification,
    clearNotifications,
    clearAllNotifications,
    getTotalNotifications,
    updateNotificationSettings,
    NotificationBadge,
    NotificationDot,
    accessibilitySettings
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Screen reader announcements */}
      <div 
        id="notification-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </NotificationContext.Provider>
  );
};

// Hook for easy badge integration
export const useNotificationBadge = (type) => {
  const { notifications, NotificationBadge, NotificationDot } = useNotifications();
  
  return {
    count: notifications[type] || 0,
    Badge: (props) => <NotificationBadge count={notifications[type] || 0} type={type} {...props} />,
    Dot: (props) => <NotificationDot show={(notifications[type] || 0) > 0} type={type} {...props} />
  };
};

export default NotificationBadgeSystem;