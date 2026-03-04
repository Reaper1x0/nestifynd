import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';


const RoutineBasicInfo = ({ 
  formData, 
  onUpdate, 
  isExpanded, 
  onToggle,
  errors = {},
  accessibilitySettings = {}
}) => {
  const [localData, setLocalData] = useState({
    name: formData.name || '',
    description: formData.description || '',
    category: formData.category || 'daily',
    color: formData.color || '#4F46E5',
    icon: formData.icon || 'Calendar'
  });

  // Sync with parent formData when it changes (e.g., from AI routine or template)
  useEffect(() => {
    setLocalData({
      name: formData.name || '',
      description: formData.description || '',
      category: formData.category || 'daily',
      color: formData.color || '#4F46E5',
      icon: formData.icon || 'Calendar'
    });
  }, [formData.name, formData.description, formData.category, formData.color, formData.icon]);

  const categories = [
    { id: 'daily', name: 'Daily Routine', icon: 'Sun', color: '#F59E0B' },
    { id: 'morning', name: 'Morning', icon: 'Sunrise', color: '#10B981' },
    { id: 'evening', name: 'Evening', icon: 'Sunset', color: '#8B5CF6' },
    { id: 'work', name: 'Work/Study', icon: 'Briefcase', color: '#3B82F6' },
    { id: 'health', name: 'Health & Wellness', icon: 'Heart', color: '#EF4444' },
    { id: 'social', name: 'Social', icon: 'Users', color: '#06B6D4' },
    { id: 'personal', name: 'Personal Care', icon: 'User', color: '#84CC16' },
    { id: 'hobby', name: 'Hobbies', icon: 'Palette', color: '#F97316' }
  ];

  const routineIcons = [
    'Calendar', 'Clock', 'CheckSquare', 'Star', 'Heart', 'Sun', 'Moon',
    'Coffee', 'Book', 'Music', 'Dumbbell', 'Utensils', 'Shower', 'Bed'
  ];

  const colorOptions = [
    '#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', 
    '#3B82F6', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  const handleInputChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleCategorySelect = (category) => {
    const updatedData = { 
      ...localData, 
      category: category.id,
      color: category.color,
      icon: category.icon
    };
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-6 text-left
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
          ${isExpanded ? 'border-b border-border' : ''}
          ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
        `}
        aria-expanded={isExpanded}
        aria-controls="basic-info-content"
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: localData.color + '20' }}
          >
            <Icon 
              name={localData.icon} 
              size={20} 
              color={localData.color}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Basic Information
            </h3>
            <p className="text-sm text-text-secondary">
              Name, description, and category
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {(errors.name || errors.description || errors.category) && (
            <Icon name="AlertCircle" size={20} className="text-error" />
          )}
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={20} 
            className="text-text-secondary"
          />
        </div>
      </button>

      {isExpanded && (
        <div 
          id="basic-info-content"
          className={`
            p-6 space-y-6
            ${!accessibilitySettings.reducedMotion ? 'animate-fade-in' : ''}
          `}
        >
          {/* Routine Name */}
          <div>
            <label 
              htmlFor="routine-name"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Routine Name <span className="text-error">*</span>
            </label>
            <Input
              id="routine-name"
              type="text"
              placeholder="Enter routine name (e.g., Morning Routine)"
              value={localData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-error focus:ring-error' : ''}
              required
              maxLength={50}
              aria-describedby={errors.name ? 'name-error' : 'name-help'}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-error" role="alert">
                {errors.name}
              </p>
            )}
            <p id="name-help" className="mt-1 text-xs text-text-secondary">
              Choose a clear, descriptive name for your routine
            </p>
          </div>

          {/* Description */}
          <div>
            <label 
              htmlFor="routine-description"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Description
            </label>
            <textarea
              id="routine-description"
              placeholder="Describe what this routine helps you accomplish..."
              value={localData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                ${errors.description ? 'border-error focus:ring-error' : 'border-border'}
                bg-surface text-text-primary placeholder-text-tertiary
              `}
              rows={3}
              maxLength={200}
              aria-describedby="description-help"
            />
            <p id="description-help" className="mt-1 text-xs text-text-secondary">
              Optional: Add details about the purpose or benefits of this routine
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Category <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${localData.category === category.id
                      ? 'border-primary bg-primary-50 text-primary' :'border-border bg-surface hover:border-primary-200 text-text-secondary hover:text-text-primary'
                    }
                    ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                  `}
                  aria-pressed={localData.category === category.id}
                  aria-label={`Select ${category.name} category`}
                >
                  <Icon 
                    name={category.icon} 
                    size={24} 
                    color={localData.category === category.id ? category.color : 'currentColor'}
                  />
                  <span className="text-xs font-medium mt-1 text-center">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-error" role="alert">
                {errors.category}
              </p>
            )}
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Routine Icon
            </label>
            <div className="grid grid-cols-7 gap-2">
              {routineIcons.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => handleInputChange('icon', iconName)}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${localData.icon === iconName
                      ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:border-primary-200 text-gray-600'
                    }
                    ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                  `}
                  aria-pressed={localData.icon === iconName}
                  aria-label={`Select ${iconName} icon`}
                >
                  <Icon 
                    name={iconName} 
                    size={20} 
                    color={localData.icon === iconName ? localData.color : '#6B7280'}
                    className={localData.icon !== iconName ? 'opacity-90' : ''}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Routine Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => handleInputChange('color', color)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${localData.color === color
                      ? 'border-text-primary scale-110' :'border-border hover:scale-105'
                    }
                    ${accessibilitySettings.reducedMotion ? 'transition-none transform-none' : ''}
                  `}
                  style={{ backgroundColor: color }}
                  aria-pressed={localData.color === color}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineBasicInfo;