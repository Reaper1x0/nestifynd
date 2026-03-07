import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Accessibility Context
const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityNavWrapper');
  }
  return context;
};

const AccessibilityNavWrapper = ({ children }) => {
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium', // 'small', 'medium', 'large', 'extra-large\'theme: \'light', // 'light', 'dark', 'auto\'focusIndicators: \'enhanced', // 'standard', 'enhanced'
    screenReader: false,
    keyboardNavigation: true
  });

  const [systemPreferences, setSystemPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false
  });

  // Load saved accessibility preferences
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAccessibilitySettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  // Monitor system preferences
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateSystemPreferences = () => {
      setSystemPreferences({
        reducedMotion: reducedMotionQuery.matches,
        highContrast: highContrastQuery.matches,
        darkMode: darkModeQuery.matches
      });
    };

    // Initial check
    updateSystemPreferences();

    // Add listeners
    reducedMotionQuery.addEventListener('change', updateSystemPreferences);
    highContrastQuery.addEventListener('change', updateSystemPreferences);
    darkModeQuery.addEventListener('change', updateSystemPreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateSystemPreferences);
      highContrastQuery.removeEventListener('change', updateSystemPreferences);
      darkModeQuery.removeEventListener('change', updateSystemPreferences);
    };
  }, []);

  // Theme/dark/high-contrast/font-size/reduced-motion classes are managed
  // globally by ThemeProvider (contexts/ThemeContext.jsx). Only apply
  // focus indicator settings here to avoid conflicts.
  useEffect(() => {
    const root = document.documentElement;

    if (accessibilitySettings.focusIndicators === 'enhanced') {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  }, [accessibilitySettings.focusIndicators]);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(accessibilitySettings));
  }, [accessibilitySettings]);

  const updateSetting = (key, value) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setAccessibilitySettings({
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      theme: 'light',
      focusIndicators: 'enhanced',
      screenReader: false,
      keyboardNavigation: true
    });
  };

  // Get effective settings (combining user preferences with system preferences)
  const getEffectiveSettings = () => {
    return {
      ...accessibilitySettings,
      reducedMotion: accessibilitySettings.reducedMotion || systemPreferences.reducedMotion,
      highContrast: accessibilitySettings.highContrast || systemPreferences.highContrast,
      darkMode: accessibilitySettings.theme === 'dark' || 
                (accessibilitySettings.theme === 'auto' && systemPreferences.darkMode)
    };
  };

  // Navigation-specific accessibility helpers
  const getNavigationClasses = (baseClasses = '') => {
    const effective = getEffectiveSettings();
    let classes = baseClasses;

    // Add motion classes
    if (effective.reducedMotion) {
      classes += ' transition-none transform-none';
    } else {
      classes += ' transition-all duration-200';
    }

    // Add focus classes
    if (effective.focusIndicators === 'enhanced') {
      classes += ' focus:ring-2 focus:ring-primary focus:ring-offset-2';
    } else {
      classes += ' focus:ring-1 focus:ring-primary';
    }

    // Add contrast classes
    if (effective.highContrast) {
      classes += ' border-2';
    }

    return classes.trim();
  };

  const getButtonClasses = (variant = 'primary', baseClasses = '') => {
    const effective = getEffectiveSettings();
    let classes = baseClasses;

    // Base button styles with accessibility considerations
    classes += ' min-w-[44px] min-h-[44px] font-medium';

    // Add motion classes
    if (!effective.reducedMotion) {
      classes += ' transition-all duration-200 hover:scale-102 active:scale-98';
    }

    // Add focus classes
    if (effective.focusIndicators === 'enhanced') {
      classes += ' focus:ring-2 focus:ring-offset-2';
    }

    return classes.trim();
  };

  const contextValue = {
    settings: accessibilitySettings,
    systemPreferences,
    effectiveSettings: getEffectiveSettings(),
    updateSetting,
    resetToDefaults,
    getNavigationClasses,
    getButtonClasses
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div 
        className="accessibility-wrapper"
        data-reduced-motion={getEffectiveSettings().reducedMotion}
        data-high-contrast={getEffectiveSettings().highContrast}
        data-font-size={accessibilitySettings.fontSize}
        data-theme={accessibilitySettings.theme}
      >
        {children}
      </div>

      {/* Accessibility announcements for screen readers */}
      <div 
        id="accessibility-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Skip links */}
      <div className="skip-links">
        <a 
          href="#main-content" 
          className="skip-link focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-500 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="skip-link focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-500 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:shadow-lg"
        >
          Skip to navigation
        </a>
      </div>

      {/* Custom CSS for accessibility features */}
      <style jsx global>{`
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        .enhanced-focus *:focus {
          outline: 2px solid var(--color-primary) !important;
          outline-offset: 2px !important;
        }

        .high-contrast {
          --color-text-primary: #000000;
          --color-text-secondary: #000000;
          --color-border: #000000;
          --color-primary: #0000FF;
          --color-error: #FF0000;
          --color-success: #008000;
        }

        .high-contrast.dark {
          --color-text-primary: #FFFFFF;
          --color-text-secondary: #FFFFFF;
          --color-border: #FFFFFF;
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-wrapper * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityNavWrapper;