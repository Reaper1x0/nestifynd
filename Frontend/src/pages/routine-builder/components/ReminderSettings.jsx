import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';


const ReminderSettings = ({ 
  formData, 
  onUpdate, 
  isExpanded, 
  onToggle,
  errors = {},
  accessibilitySettings = {}
}) => {
  const [localData, setLocalData] = useState({
    enableReminders: formData.enableReminders || true,
    reminderTypes: formData.reminderTypes || ['visual', 'audio'],
    reminderTiming: formData.reminderTiming || [
      { type: 'before', minutes: 15, enabled: true },
      { type: 'at', minutes: 0, enabled: true },
      { type: 'after', minutes: 5, enabled: false }
    ],
    escalationEnabled: formData.escalationEnabled || false,
    escalationSteps: formData.escalationSteps || [
      { delay: 5, type: 'visual', intensity: 'normal' },
      { delay: 10, type: 'audio', intensity: 'high' },
      { delay: 15, type: 'caregiver', intensity: 'urgent' }
    ],
    quietHours: formData.quietHours || {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    customMessage: formData.customMessage || '',
    snoozeOptions: formData.snoozeOptions || {
      enabled: true,
      durations: [5, 10, 15, 30],
      maxSnoozes: 3
    }
  });

  const reminderTypeOptions = [
    { id: 'visual', name: 'Visual', icon: 'Eye', description: 'Screen notifications and alerts' },
    { id: 'audio', name: 'Audio', icon: 'Volume2', description: 'Sound alerts and chimes' },
    { id: 'vibration', name: 'Vibration', icon: 'Smartphone', description: 'Device vibration (mobile)' },
    { id: 'email', name: 'Email', icon: 'Mail', description: 'Email notifications' }
  ];

  const intensityOptions = [
    { id: 'low', name: 'Low', description: 'Subtle reminder' },
    { id: 'normal', name: 'Normal', description: 'Standard reminder' },
    { id: 'high', name: 'High', description: 'Prominent reminder' },
    { id: 'urgent', name: 'Urgent', description: 'Critical reminder' }
  ];

  const handleReminderTypeToggle = (typeId) => {
    const updatedTypes = localData.reminderTypes.includes(typeId)
      ? localData.reminderTypes.filter(type => type !== typeId)
      : [...localData.reminderTypes, typeId];
    
    handleInputChange('reminderTypes', updatedTypes);
  };

  const handleInputChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleReminderTimingChange = (index, field, value) => {
    const updatedTiming = localData.reminderTiming.map((timing, i) =>
      i === index ? { ...timing, [field]: value } : timing
    );
    handleInputChange('reminderTiming', updatedTiming);
  };

  const handleEscalationStepChange = (index, field, value) => {
    const updatedSteps = localData.escalationSteps.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    );
    handleInputChange('escalationSteps', updatedSteps);
  };

  const handleQuietHoursChange = (field, value) => {
    const updatedQuietHours = { ...localData.quietHours, [field]: value };
    handleInputChange('quietHours', updatedQuietHours);
  };

  const handleSnoozeOptionsChange = (field, value) => {
    const updatedSnoozeOptions = { ...localData.snoozeOptions, [field]: value };
    handleInputChange('snoozeOptions', updatedSnoozeOptions);
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
        aria-controls="reminder-settings-content"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
            <Icon name="Bell" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Reminder Settings
            </h3>
            <p className="text-sm text-text-secondary">
              Notifications and alerts configuration
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {errors.reminders && (
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
          id="reminder-settings-content"
          className={`
            p-6 space-y-6
            ${!accessibilitySettings.reducedMotion ? 'animate-fade-in' : ''}
          `}
        >
          {/* Enable Reminders Toggle */}
          <div className="flex items-center space-x-3">
            <Input
              id="enable-reminders"
              type="checkbox"
              checked={localData.enableReminders}
              onChange={(e) => handleInputChange('enableReminders', e.target.checked)}
            />
            <label htmlFor="enable-reminders" className="text-sm font-medium text-text-primary">
              Enable reminders for this routine
            </label>
          </div>

          {localData.enableReminders && (
            <>
              {/* Reminder Types */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Reminder Types
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reminderTypeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleReminderTypeToggle(option.id)}
                      className={`
                        flex items-center p-4 rounded-lg border-2 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-primary
                        ${localData.reminderTypes.includes(option.id)
                          ? 'border-primary bg-primary-50 text-primary' :'border-border bg-surface hover:border-primary-200 text-text-secondary hover:text-text-primary'
                        }
                        ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                      `}
                      aria-pressed={localData.reminderTypes.includes(option.id)}
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

              {/* Reminder Timing */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Reminder Timing
                </label>
                <div className="space-y-3">
                  {localData.reminderTiming.map((timing, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-surface-secondary rounded-lg">
                      <Input
                        type="checkbox"
                        checked={timing.enabled}
                        onChange={(e) => handleReminderTimingChange(index, 'enabled', e.target.checked)}
                      />
                      <span className="text-sm font-medium text-text-primary min-w-[60px]">
                        {timing.type === 'before' ? 'Before:' : timing.type === 'at' ? 'At time:' : 'After:'}
                      </span>
                      <Input
                        type="number"
                        value={timing.minutes}
                        onChange={(e) => handleReminderTimingChange(index, 'minutes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={60}
                        className="w-20"
                        disabled={!timing.enabled}
                      />
                      <span className="text-sm text-text-secondary">minutes</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label htmlFor="custom-message" className="block text-sm font-medium text-text-primary mb-2">
                  Custom Reminder Message (Optional)
                </label>
                <Input
                  id="custom-message"
                  type="text"
                  placeholder="Enter a personalized reminder message..."
                  value={localData.customMessage}
                  onChange={(e) => handleInputChange('customMessage', e.target.value)}
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Leave empty to use default reminder message
                </p>
              </div>

              {/* Escalation Settings */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Input
                    id="escalation-enabled"
                    type="checkbox"
                    checked={localData.escalationEnabled}
                    onChange={(e) => handleInputChange('escalationEnabled', e.target.checked)}
                  />
                  <label htmlFor="escalation-enabled" className="text-sm font-medium text-text-primary">
                    Enable escalation for missed reminders
                  </label>
                </div>

                {localData.escalationEnabled && (
                  <div className="space-y-3">
                    <p className="text-sm text-text-secondary mb-3">
                      Configure how reminders escalate when not acknowledged:
                    </p>
                    {localData.escalationSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-surface-secondary rounded-lg">
                        <span className="text-sm font-medium text-text-primary min-w-[80px]">
                          After {step.delay} min:
                        </span>
                        <select
                          value={step.type}
                          onChange={(e) => handleEscalationStepChange(index, 'type', e.target.value)}
                          className="px-3 py-1 border border-border rounded bg-surface text-text-primary text-sm"
                        >
                          {reminderTypeOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                          <option value="caregiver">Notify Caregiver</option>
                        </select>
                        <select
                          value={step.intensity}
                          onChange={(e) => handleEscalationStepChange(index, 'intensity', e.target.value)}
                          className="px-3 py-1 border border-border rounded bg-surface text-text-primary text-sm"
                        >
                          {intensityOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiet Hours */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Input
                    id="quiet-hours-enabled"
                    type="checkbox"
                    checked={localData.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                  />
                  <label htmlFor="quiet-hours-enabled" className="text-sm font-medium text-text-primary">
                    Enable quiet hours (no audio reminders)
                  </label>
                </div>

                {localData.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quiet-start" className="block text-sm font-medium text-text-primary mb-2">
                        Start Time
                      </label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={localData.quietHours.start}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="quiet-end" className="block text-sm font-medium text-text-primary mb-2">
                        End Time
                      </label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={localData.quietHours.end}
                        onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Snooze Options */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Input
                    id="snooze-enabled"
                    type="checkbox"
                    checked={localData.snoozeOptions.enabled}
                    onChange={(e) => handleSnoozeOptionsChange('enabled', e.target.checked)}
                  />
                  <label htmlFor="snooze-enabled" className="text-sm font-medium text-text-primary">
                    Allow snoozing reminders
                  </label>
                </div>

                {localData.snoozeOptions.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="max-snoozes" className="block text-sm font-medium text-text-primary mb-2">
                        Maximum Snoozes
                      </label>
                      <Input
                        id="max-snoozes"
                        type="number"
                        value={localData.snoozeOptions.maxSnoozes}
                        onChange={(e) => handleSnoozeOptionsChange('maxSnoozes', parseInt(e.target.value) || 1)}
                        min={1}
                        max={10}
                        className="w-20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Snooze Duration Options (minutes)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 30, 60].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => {
                              const updatedDurations = localData.snoozeOptions.durations.includes(duration)
                                ? localData.snoozeOptions.durations.filter(d => d !== duration)
                                : [...localData.snoozeOptions.durations, duration];
                              handleSnoozeOptionsChange('durations', updatedDurations);
                            }}
                            className={`
                              px-3 py-1 rounded-lg border-2 text-sm transition-all duration-200
                              focus:outline-none focus:ring-2 focus:ring-primary
                              ${localData.snoozeOptions.durations.includes(duration)
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-surface hover:border-primary-200 text-text-secondary hover:text-text-primary'
                              }
                              ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                            `}
                            aria-pressed={localData.snoozeOptions.durations.includes(duration)}
                          >
                            {duration}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;