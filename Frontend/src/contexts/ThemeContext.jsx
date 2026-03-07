import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

const UI_MODE_CSS_PROPS = [
  '--color-primary', '--color-primary-600',
  '--color-secondary', '--color-secondary-600',
  '--color-background',
  '--color-text-primary',
  '--color-accent', '--color-accent-500'
];

const DENSITY_MAP = {
  compact: { card: '0.75rem', section: '0.5rem' },
  comfortable: { card: '1rem', section: '0.75rem' },
  spacious: { card: '1.5rem', section: '1rem' }
};

const BORDER_RADIUS_MAP = {
  none: '0',
  small: '0.25rem',
  medium: '0.5rem',
  large: '1rem'
};

function clearUiModeOverrides(root) {
  UI_MODE_CSS_PROPS.forEach(prop => root.style.removeProperty(prop));
  root.style.removeProperty('--ui-density-card');
  root.style.removeProperty('--ui-density-section');
  root.style.removeProperty('--ui-border-radius');
}

function applyUiModeToRoot(root, modeSettings) {
  if (!modeSettings) return;

  if (modeSettings.primaryColor) {
    root.style.setProperty('--color-primary', modeSettings.primaryColor);
    root.style.setProperty('--color-primary-600', modeSettings.primaryColor);
  }
  if (modeSettings.secondaryColor) {
    root.style.setProperty('--color-secondary', modeSettings.secondaryColor);
    root.style.setProperty('--color-secondary-600', modeSettings.secondaryColor);
  }
  if (modeSettings.backgroundColor) {
    root.style.setProperty('--color-background', modeSettings.backgroundColor);
  }
  if (modeSettings.textColor) {
    root.style.setProperty('--color-text-primary', modeSettings.textColor);
  }
  if (modeSettings.accentColor) {
    root.style.setProperty('--color-accent', modeSettings.accentColor);
    root.style.setProperty('--color-accent-500', modeSettings.accentColor);
  }

  const density = DENSITY_MAP[modeSettings.density] || DENSITY_MAP.comfortable;
  root.style.setProperty('--ui-density-card', density.card);
  root.style.setProperty('--ui-density-section', density.section);

  const radius = BORDER_RADIUS_MAP[modeSettings.borderRadius] || BORDER_RADIUS_MAP.medium;
  root.style.setProperty('--ui-border-radius', radius);
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [uiModes, setUiModes] = useState([]);
  const [settings, setSettings] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!user || loaded.current) return;
    loaded.current = true;

    (async () => {
      try {
        const modesRes = await axiosClient.get('/api/ui-modes/');
        if (Array.isArray(modesRes.data)) setUiModes(modesRes.data);
      } catch { /* non-critical */ }

      try {
        const { data } = await axiosClient.get('/api/auth/settings');
        if (data && Object.keys(data).length > 0) {
          setSettings(data);
        }
      } catch {
        const saved = localStorage.getItem('nestifynd-settings');
        if (saved) {
          try { setSettings(JSON.parse(saved)); } catch { /* ignore */ }
        }
      }
    })();
  }, [user]);

  const getUiModeForTheme = useCallback((theme, isDark) => {
    if (theme === 'auto') {
      return uiModes.find(m => m.category === (isDark ? 'dark' : 'light'));
    }
    return uiModes.find(m => m.category === theme);
  }, [uiModes]);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    let mediaListener;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const applyFullTheme = (isDark) => {
      clearUiModeOverrides(root);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      const uiMode = getUiModeForTheme(settings.theme, isDark);
      if (uiMode?.settings) {
        applyUiModeToRoot(root, uiMode.settings);
        if (uiMode.settings.reducedMotion) {
          root.classList.add('reduce-motion');
        }
      }
    };

    if (settings.theme === 'dark') {
      applyFullTheme(true);
    } else if (settings.theme === 'high-contrast') {
      applyFullTheme(false);
    } else if (settings.theme === 'auto') {
      applyFullTheme(mq.matches);
      mediaListener = (e) => applyFullTheme(e.matches);
      mq.addEventListener('change', mediaListener);
    } else {
      applyFullTheme(false);
    }

    if (settings.highContrast || settings.theme === 'high-contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (settings.fontSize) {
      case 'small': root.classList.add('text-sm'); break;
      case 'large': root.classList.add('text-lg'); break;
      case 'extra-large': root.classList.add('text-xl'); break;
      default: root.classList.add('text-base');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    return () => {
      if (mediaListener) mq.removeEventListener('change', mediaListener);
    };
  }, [settings, uiModes, getUiModeForTheme]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nestifynd-settings', JSON.stringify(newSettings));
  }, []);

  return (
    <ThemeContext.Provider value={{ uiModes, settings, updateSettings, getUiModeForTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { uiModes: [], settings: null, updateSettings: () => {}, getUiModeForTheme: () => null };
  return ctx;
}
