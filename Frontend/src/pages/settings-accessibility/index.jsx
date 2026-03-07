import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AccessibilitySection from './components/AccessibilitySection';
import AppearanceSection from './components/AppearanceSection';
import NotificationSection from './components/NotificationSection';
import AccountSection from './components/AccountSection';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import axiosClient from '../../api/axiosClient';

const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  screenReaderVerbosity: 'standard',
  enhancedKeyboard: true,
  routineColors: {
    morning: '#4F46E5',
    afternoon: '#059669',
    evening: '#7C3AED',
    health: '#DC2626',
    work: '#D97706',
    personal: '#0891B2'
  },
  completionColors: {
    completed: '#059669',
    pending: '#D97706',
    overdue: '#DC2626',
    snoozed: '#7C3AED'
  },
  uiColors: {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    accent: '#10B981',
    warning: '#D97706'
  },
  routineReminders: true,
  taskDeadlines: true,
  achievements: true,
  messages: true,
  systemUpdates: false,
  motivationalOptIn: true,
  visualAlerts: true,
  audioAlerts: true,
  vibrationAlerts: true,
  soundVolume: 50,
  escalationPattern: 'gentle',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  },
  timeZone: 'America/New_York',
  profileName: '',
  profileEmail: '',
  profilePhone: '',
  emergencyContact: '',
  emergencyPhone: '',
  shareProgress: true,
  shareRoutines: true,
  allowMessages: true,
  dataCollection: 'essential'
};

const SettingsAccessibilityPage = () => {
  const { user: authUser } = useAuth();
  const { settings: themeSettings, updateSettings: updateThemeSettings, uiModes, getUiModeForTheme } = useTheme();
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const loadedFromBackend = useRef(false);

  const [expandedSections, setExpandedSections] = useState({
    accessibility: true,
    appearance: false,
    notifications: false,
    account: false
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  useEffect(() => {
    if (themeSettings && !loadedFromBackend.current) {
      setSettings(prev => ({ ...prev, ...themeSettings }));
      loadedFromBackend.current = true;
    }
  }, [themeSettings]);

  useEffect(() => {
    if (!loadedFromBackend.current) {
      const loadSettings = async () => {
        try {
          const { data } = await axiosClient.get('/api/auth/settings');
          if (data && Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
            loadedFromBackend.current = true;
          }
        } catch {
          const saved = localStorage.getItem('nestifynd-settings');
          if (saved) {
            try {
              setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
            } catch { /* ignore */ }
          }
        }
      };
      loadSettings();
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasUnsavedChanges(true);
    updateThemeSettings(newSettings);
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      const { motivationalOptIn, ...rest } = settings;
      await axiosClient.put('/api/auth/settings', { ...rest, motivationalOptIn });

      const uiMode = getUiModeForTheme(
        settings.theme,
        settings.theme === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : settings.theme === 'dark'
      );
      if (uiMode?._id) {
        try {
          await axiosClient.put('/api/ui-modes/uimode', {
            uiModeId: uiMode._id,
            customSettings: {
              fontSize: settings.fontSize,
              highContrast: settings.highContrast,
              reducedMotion: settings.reducedMotion
            }
          });
        } catch { /* non-critical */ }
      }

      localStorage.setItem('nestifynd-settings', JSON.stringify(settings));
      setSaveStatus('saved');
      setHasUnsavedChanges(false);

      const announcement = document.getElementById('accessibility-announcements');
      if (announcement) {
        announcement.textContent = 'Settings saved successfully';
        setTimeout(() => { announcement.textContent = ''; }, 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      localStorage.setItem('nestifynd-settings', JSON.stringify(settings));
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
    }
  };

  const resetAllSettings = () => {
    if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
      const { profileName, profileEmail, profilePhone, emergencyContact, emergencyPhone, ...rest } = DEFAULT_SETTINGS;
      const newSettings = {
        ...settings,
        ...rest,
        profileName: settings.profileName,
        profileEmail: settings.profileEmail,
        profilePhone: settings.profilePhone,
        emergencyContact: settings.emergencyContact,
        emergencyPhone: settings.emergencyPhone
      };
      setSettings(newSettings);
      updateThemeSettings(newSettings);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Settings & Accessibility - NestifyND</title>
        <meta name="description" content="Customize your accessibility preferences and application settings for an optimal neurodivergent-friendly experience." />
      </Helmet>

      <Header />
      <TabNavigation />

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Icon name="Settings" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Settings & Accessibility</h1>
              <p className="text-text-secondary">Customize your experience for optimal comfort and usability</p>
            </div>
          </div>

          {/* Save Status Bar */}
          {hasUnsavedChanges && (
            <div className="flex items-center justify-between p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="AlertCircle" size={20} className="text-warning" />
                <span className="text-sm font-medium text-warning-800">
                  You have unsaved changes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to discard your changes?')) {
                      window.location.reload();
                    }
                  }}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  onClick={saveSettings}
                  disabled={saveStatus === 'saving'}
                  iconName={saveStatus === 'saving' ? 'Loader2' : 'Save'}
                  iconPosition="left"
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          <AccessibilitySection
            settings={settings}
            onSettingChange={handleSettingChange}
            isExpanded={expandedSections.accessibility}
            onToggleExpanded={() => handleSectionToggle('accessibility')}
          />

          <AppearanceSection
            settings={settings}
            onSettingChange={handleSettingChange}
            isExpanded={expandedSections.appearance}
            onToggleExpanded={() => handleSectionToggle('appearance')}
          />

          <NotificationSection
            settings={settings}
            onSettingChange={handleSettingChange}
            isExpanded={expandedSections.notifications}
            onToggleExpanded={() => handleSectionToggle('notifications')}
          />

          <AccountSection
            user={authUser}
            settings={settings}
            onSettingChange={handleSettingChange}
            isExpanded={expandedSections.account}
            onToggleExpanded={() => handleSectionToggle('account')}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-surface rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setExpandedSections({
                  accessibility: true,
                  appearance: true,
                  notifications: true,
                  account: true
                });
              }}
              iconName="Maximize2"
              iconPosition="left"
            >
              Expand All Sections
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setExpandedSections({
                  accessibility: false,
                  appearance: false,
                  notifications: false,
                  account: false
                });
              }}
              iconName="Minimize2"
              iconPosition="left"
            >
              Collapse All Sections
            </Button>
            
            <Button
              variant="outline"
              onClick={resetAllSettings}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Reset All to Defaults
            </Button>
          </div>
        </div>

        {/* Accessibility Information */}
        <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-primary-800 mb-2">
                Accessibility Commitment
              </h3>
              <p className="text-sm text-primary-700 mb-3">
                NestifyND is designed with accessibility as a core principle. All settings are 
                automatically validated for WCAG 2.1 AA compliance and will be adjusted if needed 
                to maintain usability for all users.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  WCAG 2.1 AA Compliant
                </span>
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  Screen Reader Optimized
                </span>
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  Keyboard Navigation
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Screen reader announcements */}
      <div 
        id="accessibility-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
};

export default SettingsAccessibilityPage;
