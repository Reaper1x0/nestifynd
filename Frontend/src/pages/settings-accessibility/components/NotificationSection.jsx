import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NotificationSection = ({ 
  settings, 
  onSettingChange, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const [selectedTimeZone, setSelectedTimeZone] = useState(settings.timeZone || 'America/New_York');

  const notificationTypes = [
    {
      id: 'routineReminders',
      label: 'Routine Reminders',
      description: 'Notifications for upcoming routines',
      icon: 'Clock',
      enabled: settings.routineReminders || true
    },
    {
      id: 'taskDeadlines',
      label: 'Task Deadlines',
      description: 'Alerts for overdue tasks',
      icon: 'AlertCircle',
      enabled: settings.taskDeadlines || true
    },
    {
      id: 'achievements',
      label: 'Achievements',
      description: 'Celebration of completed goals',
      icon: 'Trophy',
      enabled: settings.achievements || true
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'New messages from caregivers',
      icon: 'MessageCircle',
      enabled: settings.messages || true
    },
    {
      id: 'systemUpdates',
      label: 'System Updates',
      description: 'App updates and maintenance',
      icon: 'Settings',
      enabled: settings.systemUpdates || false
    }
  ];

  const alertMethods = [
    {
      id: 'visual',
      label: 'Visual',
      description: 'On-screen notifications',
      icon: 'Eye',
      enabled: settings.visualAlerts || true
    },
    {
      id: 'audio',
      label: 'Audio',
      description: 'Sound notifications',
      icon: 'Volume2',
      enabled: settings.audioAlerts || true
    },
    {
      id: 'vibration',
      label: 'Vibration',
      description: 'Device vibration (mobile)',
      icon: 'Smartphone',
      enabled: settings.vibrationAlerts || true
    }
  ];

  const escalationOptions = [
    { value: 'none', label: 'No Escalation', description: 'Single notification only' },
    { value: 'gentle', label: 'Gentle', description: 'Repeat after 5 minutes' },
    { value: 'moderate', label: 'Moderate', description: 'Repeat after 2 minutes' },
    { value: 'urgent', label: 'Urgent', description: 'Repeat every minute' }
  ];

  const timeZones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' }
  ];

  const handleNotificationToggle = (type, enabled) => {
    onSettingChange(type, enabled);
  };

  const handleQuietHoursChange = (field, value) => {
    const quietHours = settings.quietHours || { enabled: false, start: '22:00', end: '07:00' };
    onSettingChange('quietHours', {
      ...quietHours,
      [field]: value
    });
  };

  const handleSoundVolumeChange = (volume) => {
    onSettingChange('soundVolume', parseInt(volume));
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
        aria-expanded={isExpanded}
        aria-controls="notification-settings"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
            <Icon name="Bell" size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
            <p className="text-sm text-text-secondary">Reminder and alert preferences</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-text-secondary" 
        />
      </button>

      {isExpanded && (
        <div id="notification-settings" className="px-6 pb-6 space-y-6">
          {/* Notification Types */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Notification Types
            </label>
            <div className="space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name={type.icon} size={20} className="text-text-secondary" />
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {type.label}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {type.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle(type.id, !type.enabled)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                      ${type.enabled ? 'bg-primary' : 'bg-gray-200'}
                    `}
                    role="switch"
                    aria-checked={type.enabled}
                    aria-labelledby={`${type.id}-label`}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${type.enabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Methods */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Alert Methods
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {alertMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleNotificationToggle(`${method.id}Alerts`, !method.enabled)}
                  className={`
                    flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${method.enabled
                      ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-200 hover:bg-surface-secondary'
                    }
                  `}
                  aria-pressed={method.enabled}
                >
                  <Icon name={method.icon} size={24} className="mb-2" />
                  <div className="text-sm font-medium mb-1">{method.label}</div>
                  <div className="text-xs text-center text-text-secondary">
                    {method.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Volume */}
          {settings.audioAlerts && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-primary">
                Sound Volume
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume || 50}
                  onChange={(e) => handleSoundVolumeChange(e.target.value)}
                  className="w-full h-2 bg-surface-secondary rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Sound volume"
                />
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Silent</span>
                  <span>{settings.soundVolume || 50}%</span>
                  <span>Loud</span>
                </div>
              </div>
              
              {/* Test Sound Button */}
              <Button
                variant="outline"
                onClick={() => {
                  // Play test sound
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
                  audio.volume = (settings.soundVolume || 50) / 100;
                  audio.play().catch(() => {
                    // Handle audio play failure silently
                  });
                }}
                iconName="Volume2"
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Test Sound
              </Button>
            </div>
          )}

          {/* Escalation Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Escalation Pattern
            </label>
            <div className="space-y-2">
              {escalationOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-secondary cursor-pointer"
                >
                  <input
                    type="radio"
                    name="escalationPattern"
                    value={option.value}
                    checked={settings.escalationPattern === option.value}
                    onChange={(e) => onSettingChange('escalationPattern', e.target.value)}
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

          {/* Quiet Hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Quiet Hours
                </label>
                <p className="text-xs text-text-secondary mt-1">
                  Disable notifications during specified hours
                </p>
              </div>
              <button
                onClick={() => handleQuietHoursChange('enabled', !(settings.quietHours?.enabled || false))}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${settings.quietHours?.enabled ? 'bg-primary' : 'bg-gray-200'}
                `}
                role="switch"
                aria-checked={settings.quietHours?.enabled || false}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.quietHours?.enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            
            {settings.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={settings.quietHours?.start || '22:00'}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={settings.quietHours?.end || '07:00'}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time Zone */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Time Zone
            </label>
            <select
              value={selectedTimeZone}
              onChange={(e) => {
                setSelectedTimeZone(e.target.value);
                onSettingChange('timeZone', e.target.value);
              }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
            >
              {timeZones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Notifications */}
          <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-error-800">
                  Emergency Notifications
                </h4>
                <p className="text-xs text-error-700 mt-1">
                  Critical alerts will always be delivered regardless of quiet hours or notification settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSection;