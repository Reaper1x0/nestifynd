import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = () => {
  const [activities] = useState([
    {
      id: 1,
      type: 'routine_completed',
      title: 'Morning Routine completed',
      description: 'All 4 tasks finished successfully',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    },
    {
      id: 2,
      type: 'achievement_earned',
      title: 'Achievement unlocked: Early Bird',
      description: 'Completed morning routine before 8 AM for 7 days',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      icon: 'Award',
      color: 'text-warning',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200'
    },
    {
      id: 3,
      type: 'task_completed',
      title: 'Task completed: Take medication',
      description: 'Part of Morning Routine',
      timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
      icon: 'Check',
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    },
    {
      id: 4,
      type: 'routine_snoozed',
      title: 'Work Focus Session snoozed',
      description: 'Rescheduled for 2:00 PM',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200'
    },
    {
      id: 5,
      type: 'streak_milestone',
      title: 'Streak milestone reached',
      description: '12-day consistency streak achieved',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      icon: 'Zap',
      color: 'text-secondary',
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200'
    },
    {
      id: 6,
      type: 'routine_created',
      title: 'New routine created: Evening Wind Down',
      description: 'Added 4 tasks for better sleep preparation',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      icon: 'Plus',
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    }
  ]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'routine_completed':
        return 'Routine Completed';
      case 'achievement_earned':
        return 'Achievement Earned';
      case 'task_completed':
        return 'Task Completed';
      case 'routine_snoozed':
        return 'Routine Snoozed';
      case 'streak_milestone':
        return 'Streak Milestone';
      case 'routine_created':
        return 'Routine Created';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <Icon name="Activity" size={24} className="mr-2 text-primary" />
          Recent Activity
        </h2>
        <button 
          className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label="View all activities"
        >
          <Icon name="MoreHorizontal" size={20} />
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start space-x-4 p-4 rounded-lg border ${activity.bgColor} ${activity.borderColor} hover:shadow-sm transition-shadow`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-surface flex items-center justify-center border ${activity.borderColor}`}>
              <Icon 
                name={activity.icon} 
                size={20} 
                className={activity.color}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-text-primary truncate">
                  {activity.title}
                </h3>
                <span className="text-xs text-text-tertiary whitespace-nowrap ml-2">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-text-secondary mb-2">
                {activity.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activity.color} ${activity.bgColor} border ${activity.borderColor}`}>
                  {getActivityTypeLabel(activity.type)}
                </span>
                
                {activity.type === 'achievement_earned' && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-warning" />
                    <span className="text-xs text-warning font-medium">+50 XP</span>
                  </div>
                )}
                
                {activity.type === 'routine_completed' && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Zap" size={14} className="text-success" />
                    <span className="text-xs text-success font-medium">Streak +1</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="mx-auto text-text-tertiary mb-4" />
          <p className="text-text-secondary mb-4">No recent activity to show</p>
          <p className="text-sm text-text-tertiary">
            Complete some routines to see your activity here
          </p>
        </div>
      )}

      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-text-primary">12</div>
            <div className="text-xs text-text-secondary">Today's Actions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-text-primary">89%</div>
            <div className="text-xs text-text-secondary">Success Rate</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-text-primary">3</div>
            <div className="text-xs text-text-secondary">Achievements</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;