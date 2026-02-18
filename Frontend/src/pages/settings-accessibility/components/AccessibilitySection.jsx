import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';



const AccessibilitySection = ({ 
  settings, 
  onSettingChange, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const [previewText, setPreviewText] = useState("This is how your text will appear with the selected font size.");

  const themeOptions = [
    { value: 'light', label: 'Light', icon: 'Sun', description: 'Bright background with dark text' },
    { value: 'dark', label: 'Dark', icon: 'Moon', description: 'Dark background with light text' },
    { value: 'auto', label: 'Auto', icon: 'Monitor', description: 'Follows system preference' },
    { value: 'high-contrast', label: 'High Contrast', icon: 'Eye', description: 'Maximum contrast for better visibility' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', size: 'text-sm', description: '14px - Compact view' },
    { value: 'medium', label: 'Medium', size: 'text-base', description: '16px - Standard size' },
    { value: 'large', label: 'Large', size: 'text-lg', description: '18px - Easier to read' },
    { value: 'extra-large', label: 'Extra Large', size: 'text-xl', description: '20px - Maximum readability' }
  ];

  const screenReaderOptions = [
    { value: 'minimal', label: 'Minimal', description: 'Essential information only' },
    { value: 'standard', label: 'Standard', description: 'Balanced detail level' },
    { value: 'verbose', label: 'Verbose', description: 'Detailed descriptions' }
  ];

  const handleThemeChange = (theme) => {
    onSettingChange('theme', theme);
    
    // Announce theme change to screen readers
    const announcement = `Theme changed to ${theme}`;
    announceToScreenReader(announcement);
  };

  const handleFontSizeChange = (fontSize) => {
    onSettingChange('fontSize', fontSize);
    
    // Update preview text
    const selectedOption = fontSizeOptions.find(option => option.value === fontSize);
    if (selectedOption) {
      announceToScreenReader(`Font size changed to ${selectedOption.label}`);
    }
  };

  const announceToScreenReader = (message) => {
    const announcement = document.getElementById('accessibility-announcements');
    if (announcement) {
      announcement.textContent = message;
      setTimeout(() => {
        announcement.textContent = '';
      }, 1000);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
        aria-expanded={isExpanded}
        aria-controls="accessibility-settings"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
            <Icon name="Accessibility" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Accessibility</h2>
            <p className="text-sm text-text-secondary">Visual and interaction preferences</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-text-secondary" 
        />
      </button>

      {isExpanded && (
        <div id="accessibility-settings" className="px-6 pb-6 space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Theme Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`
                    flex items-center space-x-3 p-4 rounded-lg border-2 text-left
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                    ${settings.theme === option.value
                      ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-200 hover:bg-surface-secondary'
                    }
                  `}
                  aria-pressed={settings.theme === option.value}
                  aria-describedby={`theme-${option.value}-desc`}
                >
                  <Icon name={option.icon} size={20} />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div 
                      id={`theme-${option.value}-desc`}
                      className="text-xs text-text-secondary mt-1"
                    >
                      {option.description}
                    </div>
                  </div>
                  {settings.theme === option.value && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Controls */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Font Size
            </label>
            <div className="space-y-3">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value)}
                  className={`
                    flex items-center justify-between w-full p-4 rounded-lg border-2 text-left
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                    ${settings.fontSize === option.value
                      ? 'border-primary bg-primary-50' :'border-border hover:border-primary-200 hover:bg-surface-secondary'
                    }
                  `}
                  aria-pressed={settings.fontSize === option.value}
                  aria-describedby={`font-${option.value}-desc`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-medium ${option.size}`}>
                      {option.label}
                    </span>
                    <span 
                      id={`font-${option.value}-desc`}
                      className="text-sm text-text-secondary"
                    >
                      {option.description}
                    </span>
                  </div>
                  {settings.fontSize === option.value && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Font Size Preview */}
            <div className="mt-4 p-4 bg-surface-secondary rounded-lg border border-border">
              <p className="text-sm text-text-secondary mb-2">Preview:</p>
              <p className={`${fontSizeOptions.find(opt => opt.value === settings.fontSize)?.size || 'text-base'} text-text-primary`}>
                {previewText}
              </p>
            </div>
          </div>

          {/* Motion Preferences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Reduced Motion
                </label>
                <p className="text-xs text-text-secondary mt-1">
                  Minimizes animations and transitions for better focus
                </p>
              </div>
              <button
                onClick={() => onSettingChange('reducedMotion', !settings.reducedMotion)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${settings.reducedMotion ? 'bg-primary' : 'bg-gray-200'}
                `}
                role="switch"
                aria-checked={settings.reducedMotion}
                aria-labelledby="reduced-motion-label"
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  High Contrast Mode
                </label>
                <p className="text-xs text-text-secondary mt-1">
                  Increases contrast for better visibility
                </p>
              </div>
              <button
                onClick={() => onSettingChange('highContrast', !settings.highContrast)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${settings.highContrast ? 'bg-primary' : 'bg-gray-200'}
                `}
                role="switch"
                aria-checked={settings.highContrast}
                aria-labelledby="high-contrast-label"
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Screen Reader Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Screen Reader Verbosity
            </label>
            <div className="space-y-2">
              {screenReaderOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-secondary cursor-pointer"
                >
                  <input
                    type="radio"
                    name="screenReaderVerbosity"
                    value={option.value}
                    checked={settings.screenReaderVerbosity === option.value}
                    onChange={(e) => onSettingChange('screenReaderVerbosity', e.target.value)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">
                      {option.label}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Keyboard Navigation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Enhanced Keyboard Navigation
                </label>
                <p className="text-xs text-text-secondary mt-1">
                  Improved focus indicators and keyboard shortcuts
                </p>
              </div>
              <button
                onClick={() => onSettingChange('enhancedKeyboard', !settings.enhancedKeyboard)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${settings.enhancedKeyboard ? 'bg-primary' : 'bg-gray-200'}
                `}
                role="switch"
                aria-checked={settings.enhancedKeyboard}
                aria-labelledby="enhanced-keyboard-label"
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.enhancedKeyboard ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilitySection;