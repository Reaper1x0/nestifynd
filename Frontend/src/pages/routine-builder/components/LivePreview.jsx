import React from 'react';
import Icon from '../../../components/AppIcon';

const LivePreview = ({ 
  formData, 
  isVisible = true,
  accessibilitySettings = {}
}) => {
  if (!isVisible) return null;

  const {
    name = 'Untitled Routine',
    description = '',
    category = 'daily',
    color = '#4F46E5',
    icon = 'Calendar',
    frequency = 'daily',
    time = '09:00',
    duration = 30,
    tasks = [],
    enableReminders = true,
    reminderTypes = ['visual']
  } = formData;

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getFrequencyText = () => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'custom': return 'Custom';
      default: return 'Daily';
    }
  };

  const getCategoryColor = () => {
    const categoryColors = {
      daily: '#F59E0B',
      morning: '#10B981',
      evening: '#8B5CF6',
      work: '#3B82F6',
      health: '#EF4444',
      social: '#06B6D4',
      personal: '#84CC16',
      hobby: '#F97316'
    };
    return categoryColors[category] || color;
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
          <Icon name="Eye" size={20} />
          <span>Live Preview</span>
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          See how your routine will appear
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Dashboard Card Preview */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Dashboard View</h4>
          <div 
            className={`
              p-4 rounded-lg border-l-4 bg-surface-secondary
              ${!accessibilitySettings.reducedMotion ? 'hover:shadow-md transition-shadow duration-200' : ''}
            `}
            style={{ borderLeftColor: getCategoryColor() }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getCategoryColor() + '20' }}
                >
                  <Icon 
                    name={icon} 
                    size={20} 
                    color={getCategoryColor()}
                  />
                </div>
                <div>
                  <h5 className="font-semibold text-text-primary">{name}</h5>
                  {description && (
                    <p className="text-sm text-text-secondary line-clamp-1">{description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-text-secondary mt-1">
                    <span className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{formatTime(time)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Timer" size={12} />
                      <span>{duration} min</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Repeat" size={12} />
                      <span>{getFrequencyText()}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {enableReminders && (
                  <Icon name="Bell" size={16} className="text-warning" />
                )}
                <span className="px-2 py-1 bg-success-100 text-success text-xs rounded">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View Preview */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Calendar View</h4>
          <div className="bg-surface-secondary rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">Today</span>
              <span className="text-xs text-text-secondary">{formatTime(time)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor() }}
              />
              <span className="text-sm font-medium text-text-primary">{name}</span>
              <span className="text-xs text-text-secondary">({duration}m)</span>
            </div>
          </div>
        </div>

        {/* Task List Preview */}
        {tasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Tasks ({tasks.length})
            </h4>
            <div className="space-y-2">
              {tasks.slice(0, 3).map((task, index) => (
                <div key={task.id || index} className="flex items-center space-x-3 p-2 bg-surface-secondary rounded">
                  <div className="w-4 h-4 border-2 border-border rounded flex items-center justify-center">
                    <Icon name="Check" size={12} className="text-success opacity-0" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-primary">{task.name}</span>
                    {task.estimatedTime && (
                      <span className="text-xs text-text-secondary ml-2">
                        ({task.estimatedTime}m)
                      </span>
                    )}
                  </div>
                  {task.isRequired && (
                    <span className="px-1 py-0.5 bg-error-100 text-error text-xs rounded">
                      Required
                    </span>
                  )}
                </div>
              ))}
              {tasks.length > 3 && (
                <div className="text-center py-2">
                  <span className="text-xs text-text-secondary">
                    +{tasks.length - 3} more task{tasks.length - 3 !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reminder Preview */}
        {enableReminders && (
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Reminder Preview</h4>
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Bell" size={16} className="text-warning" />
                <span className="text-sm font-medium text-warning">Routine Reminder</span>
              </div>
              <p className="text-sm text-text-primary">
                Time for your "{name}" routine!
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {reminderTypes.includes('visual') && (
                  <span className="px-2 py-1 bg-primary-100 text-primary text-xs rounded">
                    Visual
                  </span>
                )}
                {reminderTypes.includes('audio') && (
                  <span className="px-2 py-1 bg-secondary-100 text-secondary text-xs rounded">
                    Audio
                  </span>
                )}
                {reminderTypes.includes('vibration') && (
                  <span className="px-2 py-1 bg-accent-100 text-accent text-xs rounded">
                    Vibration
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Summary</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-surface-secondary rounded-lg">
              <div className="text-lg font-semibold text-text-primary">{tasks.length}</div>
              <div className="text-xs text-text-secondary">Tasks</div>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded-lg">
              <div className="text-lg font-semibold text-text-primary">{duration}</div>
              <div className="text-xs text-text-secondary">Minutes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;