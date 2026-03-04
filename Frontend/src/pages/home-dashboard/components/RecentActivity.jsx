import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import axiosClient from '../../../api/axiosClient';

const typeToDisplay = (type) => {
  switch (type) {
    case 'task_completed':
      return { icon: 'Check', color: 'text-primary', bgColor: 'bg-primary-50', borderColor: 'border-primary-200', label: 'Task Completed' };
    case 'task_snoozed':
      return { icon: 'Clock', color: 'text-warning', bgColor: 'bg-warning-50', borderColor: 'border-warning-200', label: 'Task Snoozed' };
    case 'task_dismissed':
      return { icon: 'XCircle', color: 'text-text-tertiary', bgColor: 'bg-surface-tertiary', borderColor: 'border-border-secondary', label: 'Task Dismissed' };
    case 'reminder_sent':
      return { icon: 'Bell', color: 'text-primary', bgColor: 'bg-primary-50', borderColor: 'border-primary-200', label: 'Reminder' };
    case 'routine_activated':
      return { icon: 'Play', color: 'text-success', bgColor: 'bg-success-50', borderColor: 'border-success-200', label: 'Routine Activated' };
    case 'routine_deactivated':
      return { icon: 'Pause', color: 'text-text-secondary', bgColor: 'bg-surface-secondary', borderColor: 'border-border', label: 'Routine Paused' };
    case 'user_login':
    case 'user_logout':
      return { icon: 'User', color: 'text-text-secondary', bgColor: 'bg-surface-secondary', borderColor: 'border-border', label: 'Session' };
    default:
      return { icon: 'Activity', color: 'text-primary', bgColor: 'bg-primary-50', borderColor: 'border-primary-200', label: 'Activity' };
  }
};

const formatTimeAgo = (dateStr) => {
  const timestamp = new Date(dateStr).getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/api/activities?limit=20')
      .then((res) => {
        setActivities(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-border mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center mb-6">
          <Icon name="Activity" size={24} className="mr-2 text-primary" />
          Recent Activity
        </h2>
        <div className="flex items-center justify-center py-12">
          <span className="text-text-secondary">Loading activity...</span>
        </div>
      </div>
    );
  }

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
        {activities.map((activity) => {
          const display = typeToDisplay(activity.type || 'other');
          const title = activity.action || 'Activity';
          const description = activity.details || (activity.relatedRoutine?.title ? `Part of ${activity.relatedRoutine.title}` : '');
          return (
            <div
              key={activity._id}
              className={`flex items-start space-x-4 p-4 rounded-lg border ${display.bgColor} ${display.borderColor} hover:shadow-sm transition-shadow`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-surface flex items-center justify-center border ${display.borderColor}`}>
                <Icon name={display.icon} size={20} className={display.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-text-primary truncate">{title}</h3>
                  <span className="text-xs text-text-tertiary whitespace-nowrap ml-2">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
                {description && (
                  <p className="text-sm text-text-secondary mb-2">{description}</p>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${display.color} ${display.bgColor} border ${display.borderColor}`}>
                  {display.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="mx-auto text-text-tertiary mb-4" />
          <p className="text-text-secondary mb-4">No recent activity to show</p>
          <p className="text-sm text-text-tertiary">
            Complete routines and tasks to see your activity here
          </p>
        </div>
      )}

      {/* Summary: optional, can be driven by API later */}
      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-text-primary">{activities.length}</div>
              <div className="text-xs text-text-secondary">Recent items</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-text-primary">
                {activities.filter((a) => a.type === 'task_completed' || a.type === 'routine_activated').length}
              </div>
              <div className="text-xs text-text-secondary">Completions</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-text-primary">
                {new Set(activities.map((a) => a.type)).size}
              </div>
              <div className="text-xs text-text-secondary">Activity types</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
