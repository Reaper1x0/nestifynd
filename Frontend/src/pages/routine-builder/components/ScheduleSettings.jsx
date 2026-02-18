import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';


const ScheduleSettings = ({ 
  formData, 
  onUpdate, 
  isExpanded, 
  onToggle,
  errors = {},
  accessibilitySettings = {}
}) => {
  const [localData, setLocalData] = useState({
    frequency: formData.frequency || 'daily',
    time: formData.time || '09:00',
    duration: formData.duration || 30,
    daysOfWeek: formData.daysOfWeek || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startDate: formData.startDate || new Date().toISOString().split('T')[0],
    endDate: formData.endDate || '',
    timeFlexibility: formData.timeFlexibility || 15,
    autoReschedule: formData.autoReschedule || false
  });

  const frequencyOptions = [
    { id: 'daily', name: 'Daily', icon: 'Calendar', description: 'Every day' },
    { id: 'weekly', name: 'Weekly', icon: 'CalendarDays', description: 'Specific days of the week' },
    { id: 'custom', name: 'Custom', icon: 'Settings', description: 'Custom schedule' }
  ];

  const daysOfWeek = [
    { id: 'monday', name: 'Mon', fullName: 'Monday' },
    { id: 'tuesday', name: 'Tue', fullName: 'Tuesday' },
    { id: 'wednesday', name: 'Wed', fullName: 'Wednesday' },
    { id: 'thursday', name: 'Thu', fullName: 'Thursday' },
    { id: 'friday', name: 'Fri', fullName: 'Friday' },
    { id: 'saturday', name: 'Sat', fullName: 'Saturday' },
    { id: 'sunday', name: 'Sun', fullName: 'Sunday' }
  ];

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ];

  const handleInputChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleDayToggle = (dayId) => {
    const updatedDays = localData.daysOfWeek.includes(dayId)
      ? localData.daysOfWeek.filter(day => day !== dayId)
      : [...localData.daysOfWeek, dayId];
    
    handleInputChange('daysOfWeek', updatedDays);
  };

  const handleFrequencyChange = (frequency) => {
    let updatedData = { ...localData, frequency };
    
    if (frequency === 'daily') {
      updatedData.daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    } else if (frequency === 'weekly') {
      updatedData.daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    }
    
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
        aria-controls="schedule-settings-content"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Schedule Settings
            </h3>
            <p className="text-sm text-text-secondary">
              Frequency, timing, and duration
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {(errors.frequency || errors.time || errors.duration) && (
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
          id="schedule-settings-content"
          className={`
            p-6 space-y-6
            ${!accessibilitySettings.reducedMotion ? 'animate-fade-in' : ''}
          `}
        >
          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Frequency <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFrequencyChange(option.id)}
                  className={`
                    flex items-center p-4 rounded-lg border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${localData.frequency === option.id
                      ? 'border-primary bg-primary-50 text-primary' :'border-border bg-surface hover:border-primary-200 text-text-secondary hover:text-text-primary'
                    }
                    ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                  `}
                  aria-pressed={localData.frequency === option.id}
                >
                  <Icon name={option.icon} size={20} className="mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week (for weekly/custom frequency) */}
          {(localData.frequency === 'weekly' || localData.frequency === 'custom') && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Days of the Week
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary
                      ${localData.daysOfWeek.includes(day.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-surface hover:border-primary-200 text-text-secondary hover:text-text-primary'
                      }
                      ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                    `}
                    aria-pressed={localData.daysOfWeek.includes(day.id)}
                    aria-label={`Toggle ${day.fullName}`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="routine-time"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Preferred Time <span className="text-error">*</span>
              </label>
              <Input
                id="routine-time"
                type="time"
                value={localData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={errors.time ? 'border-error focus:ring-error' : ''}
                required
                aria-describedby="time-help"
              />
              <p id="time-help" className="mt-1 text-xs text-text-secondary">
                When do you usually do this routine?
              </p>
            </div>

            <div>
              <label 
                htmlFor="routine-duration"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Duration <span className="text-error">*</span>
              </label>
              <select
                id="routine-duration"
                value={localData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className={`
                  w-full px-3 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                  ${errors.duration ? 'border-error focus:ring-error' : 'border-border'}
                  bg-surface text-text-primary
                `}
                required
                aria-describedby="duration-help"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p id="duration-help" className="mt-1 text-xs text-text-secondary">
                How long does this routine typically take?
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="start-date"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Start Date <span className="text-error">*</span>
              </label>
              <Input
                id="start-date"
                type="date"
                value={localData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label 
                htmlFor="end-date"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                End Date (Optional)
              </label>
              <Input
                id="end-date"
                type="date"
                value={localData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={localData.startDate}
                placeholder="Leave empty for ongoing routine"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-border pt-6">
            <h4 className="text-md font-medium text-text-primary mb-4">
              Advanced Settings
            </h4>
            
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="time-flexibility"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Time Flexibility (minutes)
                </label>
                <Input
                  id="time-flexibility"
                  type="number"
                  value={localData.timeFlexibility}
                  onChange={(e) => handleInputChange('timeFlexibility', parseInt(e.target.value) || 0)}
                  min={0}
                  max={120}
                  placeholder="15"
                  aria-describedby="flexibility-help"
                />
                <p id="flexibility-help" className="mt-1 text-xs text-text-secondary">
                  How many minutes before/after the scheduled time is acceptable?
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Input
                  id="auto-reschedule"
                  type="checkbox"
                  checked={localData.autoReschedule}
                  onChange={(e) => handleInputChange('autoReschedule', e.target.checked)}
                />
                <label 
                  htmlFor="auto-reschedule"
                  className="text-sm font-medium text-text-primary cursor-pointer"
                >
                  Auto-reschedule missed routines
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSettings;