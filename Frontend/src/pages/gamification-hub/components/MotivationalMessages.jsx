import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

const MotivationalMessages = ({ 
  userActivity = {}, 
  preferences = {},
  onDismissMessage,
  onShareAchievement 
}) => {
  const { getNavigationClasses, effectiveSettings } = useAccessibility();
  const [currentMessage, setCurrentMessage] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);

  const motivationalMessages = [
    {
      id: 'streak_milestone',
      type: 'celebration',
      title: "Amazing Streak! 🔥",
      message: "You\'ve maintained your routine for 7 days straight! Your consistency is building great habits.",
      icon: 'Flame',
      color: 'warning',
      trigger: 'streak_achievement',
      actions: [
        { label: 'Share Achievement', action: 'share', icon: 'Share2' },
        { label: 'Keep Going!', action: 'dismiss', icon: 'ArrowRight' }
      ]
    },
    {
      id: 'completion_boost',
      type: 'encouragement',
      title: "You\'re Doing Great! ⭐",
      message: "You\'ve completed 80% of your tasks this week. Just a little more to reach your goal!",
      icon: 'Star',
      color: 'success',
      trigger: 'high_completion',
      actions: [
        { label: 'View Progress', action: 'view_progress', icon: 'BarChart3' },
        { label: 'Got It!', action: 'dismiss', icon: 'Check' }
      ]
    },
    {
      id: 'gentle_reminder',
      type: 'gentle',
      title: "No Pressure! 💙",
      message: "It's okay to have off days. Tomorrow is a fresh start, and we believe in you!",
      icon: 'Heart',
      color: 'primary',
      trigger: 'low_activity',
      actions: [
        { label: 'Adjust Goals', action: 'adjust_goals', icon: 'Settings' },
        { label: 'Thanks', action: 'dismiss', icon: 'Smile' }
      ]
    },
    {
      id: 'new_badge',
      type: 'achievement',
      title: "New Badge Earned! 🏆",
      message: "Congratulations! You\'ve earned the \'Consistency Champion\' badge for completing routines 5 days in a row.",
      icon: 'Award',
      color: 'success',
      trigger: 'badge_earned',
      actions: [
        { label: 'View Badge', action: 'view_badge', icon: 'Eye' },
        { label: 'Share', action: 'share', icon: 'Share2' }
      ]
    },
    {
      id: 'weekly_summary',
      type: 'summary',
      title: "Week in Review 📊",
      message: "This week you completed 12 tasks, earned 240 points, and maintained a 3-day streak. Great progress!",
      icon: 'BarChart3',
      color: 'primary',
      trigger: 'weekly_summary',
      actions: [
        { label: 'Full Report', action: 'view_report', icon: 'FileText' },
        { label: 'Next Week', action: 'dismiss', icon: 'ArrowRight' }
      ]
    }
  ];

  // Determine which message to show based on user activity
  useEffect(() => {
    const determineMessage = () => {
      // Mock logic - in real app this would analyze user activity
      const { streakDays = 0, completionRate = 0, recentActivity = 'normal' } = userActivity;
      
      if (streakDays >= 7) {
        return motivationalMessages.find(m => m.id === 'streak_milestone');
      } else if (completionRate >= 0.8) {
        return motivationalMessages.find(m => m.id === 'completion_boost');
      } else if (recentActivity === 'low') {
        return motivationalMessages.find(m => m.id === 'gentle_reminder');
      } else if (userActivity.newBadge) {
        return motivationalMessages.find(m => m.id === 'new_badge');
      } else if (userActivity.weeklyUpdate) {
        return motivationalMessages.find(m => m.id === 'weekly_summary');
      }
      
      return null;
    };

    const message = determineMessage();
    if (message && !messageHistory.includes(message.id)) {
      setCurrentMessage(message);
    }
  }, [userActivity, messageHistory]);

  const handleAction = (action, message) => {
    switch (action) {
      case 'share':
        onShareAchievement && onShareAchievement(message);
        break;
      case 'view_progress':
        // Navigate to progress view
        break;
      case 'adjust_goals':
        // Navigate to settings
        break;
      case 'view_badge':
        // Show badge details
        break;
      case 'view_report':
        // Show weekly report
        break;
      case 'dismiss':
      default:
        handleDismiss(message);
        break;
    }
  };

  const handleDismiss = (message) => {
    setMessageHistory(prev => [...prev, message.id]);
    setCurrentMessage(null);
    onDismissMessage && onDismissMessage(message.id);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-50 border-primary-200 text-primary-700',
      success: 'bg-success-50 border-success-200 text-success-700',
      warning: 'bg-warning-50 border-warning-200 text-warning-700',
      error: 'bg-error-50 border-error-200 text-error-700'
    };
    return colorMap[color] || colorMap.primary;
  };

  const getIconColor = (color) => {
    const colorMap = {
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error'
    };
    return colorMap[color] || colorMap.primary;
  };

  if (!currentMessage || preferences.hideMotivationalMessages) {
    return null;
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div 
        className={`
          relative rounded-lg border-2 p-4
          ${getColorClasses(currentMessage.color)}
          ${!effectiveSettings.reducedMotion ? 'animate-fade-in' : ''}
        `}
        role="alert"
        aria-live="polite"
      >
        {/* Dismiss Button */}
        <button
          onClick={() => handleDismiss(currentMessage)}
          className={`
            absolute top-2 right-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10
            ${getNavigationClasses('transition-colors duration-200')}
          `}
          aria-label="Dismiss message"
        >
          <Icon name="X" size={16} className="text-current opacity-60" />
        </button>

        {/* Message Content */}
        <div className="flex items-start space-x-3 pr-8">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <Icon 
              name={currentMessage.icon} 
              size={24} 
              className={getIconColor(currentMessage.color)}
            />
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h4 className="font-semibold text-current mb-1">
              {currentMessage.title}
            </h4>
            <p className="text-sm text-current opacity-90 mb-3">
              {currentMessage.message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {currentMessage.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleAction(action.action, currentMessage)}
                  iconName={action.icon}
                  iconPosition="left"
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Indicator (for certain message types) */}
        {currentMessage.type === 'encouragement' && userActivity.completionRate && (
          <div className="mt-4 pt-3 border-t border-current border-opacity-20">
            <div className="flex items-center justify-between text-xs text-current opacity-80 mb-1">
              <span>Weekly Progress</span>
              <span>{Math.round(userActivity.completionRate * 100)}%</span>
            </div>
            <div className="w-full bg-current bg-opacity-20 rounded-full h-2">
              <div
                className="bg-current h-2 rounded-full transition-all duration-500"
                style={{ width: `${userActivity.completionRate * 100}%` }}
                role="progressbar"
                aria-valuenow={userActivity.completionRate * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>

      {/* Message Type Indicator */}
      <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
        <span className="capitalize">{currentMessage.type} message</span>
        <button
          onClick={() => handleDismiss(currentMessage)}
          className={`
            hover:text-text-primary
            ${getNavigationClasses('transition-colors duration-200')}
          `}
        >
          Don't show similar messages
        </button>
      </div>
    </div>
  );
};

export default MotivationalMessages;