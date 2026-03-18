import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AppearanceSection = ({ 
  settings, 
  onSettingChange, 
  isExpanded, 
  onToggleExpanded,
  allowColorChanges = true
}) => {
  const [selectedColorCategory, setSelectedColorCategory] = useState('routine');

  const colorCategories = [
    { 
      id: 'routine', 
      label: 'Routine Categories', 
      description: 'Colors for different routine types',
      colors: settings.routineColors || {
        morning: '#4F46E5',
        afternoon: '#059669',
        evening: '#7C3AED',
        health: '#DC2626',
        work: '#D97706',
        personal: '#0891B2'
      }
    },
    { 
      id: 'completion', 
      label: 'Task States', 
      description: 'Colors for task completion status',
      colors: settings.completionColors || {
        completed: '#059669',
        pending: '#D97706',
        overdue: '#DC2626',
        snoozed: '#7C3AED'
      }
    },
    { 
      id: 'ui', 
      label: 'UI Elements', 
      description: 'Interface accent colors',
      colors: settings.uiColors || {
        primary: '#4F46E5',
        secondary: '#7C3AED',
        accent: '#10B981',
        warning: '#D97706'
      }
    }
  ];

  const presetThemes = [
    {
      name: 'Ocean Blue',
      colors: {
        primary: '#0891B2',
        secondary: '#0E7490',
        accent: '#06B6D4'
      }
    },
    {
      name: 'Forest Green',
      colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10B981'
      }
    },
    {
      name: 'Sunset Orange',
      colors: {
        primary: '#EA580C',
        secondary: '#C2410C',
        accent: '#FB923C'
      }
    },
    {
      name: 'Purple Dream',
      colors: {
        primary: '#7C3AED',
        secondary: '#6D28D9',
        accent: '#A78BFA'
      }
    }
  ];

  const handleColorChange = (category, colorKey, color) => {
    const categoryKey = `${category}Colors`;
    const updatedColors = {
      ...settings[categoryKey],
      [colorKey]: color
    };
    onSettingChange(categoryKey, updatedColors);
  };

  const applyPresetTheme = (theme) => {
    onSettingChange('uiColors', {
      ...settings.uiColors,
      ...theme.colors
    });
  };

  const resetToDefaults = () => {
    onSettingChange('routineColors', {
      morning: '#4F46E5',
      afternoon: '#059669',
      evening: '#7C3AED',
      health: '#DC2626',
      work: '#D97706',
      personal: '#0891B2'
    });
    onSettingChange('completionColors', {
      completed: '#059669',
      pending: '#D97706',
      overdue: '#DC2626',
      snoozed: '#7C3AED'
    });
    onSettingChange('uiColors', {
      primary: '#4F46E5',
      secondary: '#7C3AED',
      accent: '#10B981',
      warning: '#D97706'
    });
  };

  const selectedCategory = colorCategories.find(cat => cat.id === selectedColorCategory);

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
        aria-expanded={isExpanded}
        aria-controls="appearance-settings"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
            <Icon name="Palette" size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Appearance</h2>
            <p className="text-sm text-text-secondary">Colors and visual customization</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-text-secondary" 
        />
      </button>

      {isExpanded && (
        <div id="appearance-settings" className="px-6 pb-6 space-y-6">
          {!allowColorChanges && (
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg text-warning-800 text-sm flex items-center gap-2">
              <Icon name="Lock" size={18} className="flex-shrink-0" />
              Color customization is not included in your plan. Upgrade to Premium to customize colors.
            </div>
          )}
          {/* Preset Themes */}
          <div className={`space-y-3 ${!allowColorChanges ? 'pointer-events-none opacity-60' : ''}`}>
            <label className="block text-sm font-medium text-text-primary">
              Quick Themes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presetThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyPresetTheme(theme)}
                  className="flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary-200 hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  aria-label={`Apply ${theme.name} theme`}
                >
                  <div className="flex space-x-1 mb-2">
                    {Object.values(theme.colors).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-text-primary">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Category Selection */}
          <div className={`space-y-3 ${!allowColorChanges ? 'pointer-events-none opacity-60' : ''}`}>
            <label className="block text-sm font-medium text-text-primary">
              Customize Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {colorCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedColorCategory(category.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${selectedColorCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
                    }
                  `}
                  aria-pressed={selectedColorCategory === category.id}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          {selectedCategory && (
            <div className={`space-y-4 ${!allowColorChanges ? 'pointer-events-none opacity-60' : ''}`}>
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-1">
                  {selectedCategory.label}
                </h3>
                <p className="text-xs text-text-secondary">
                  {selectedCategory.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(selectedCategory.colors).map(([key, color]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(selectedColorCategory, key, e.target.value)}
                        className="w-12 h-10 rounded-lg border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`Choose color for ${key}`}
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => handleColorChange(selectedColorCategory, key, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                          placeholder="#000000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                    </div>
                    
                    {/* Color Preview */}
                    <div className="flex items-center space-x-2 text-xs text-text-secondary">
                      <div
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span>Preview</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Accessibility Check */}
          <div className={`p-4 bg-warning-50 border border-warning-200 rounded-lg ${!allowColorChanges ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-warning-800">
                  Accessibility Note
                </h4>
                <p className="text-xs text-warning-700 mt-1">
                  Custom colors are automatically checked for WCAG compliance. 
                  Colors that don't meet accessibility standards will be adjusted automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className={`flex justify-end pt-4 border-t border-border ${!allowColorChanges ? 'pointer-events-none opacity-60' : ''}`}>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearanceSection;