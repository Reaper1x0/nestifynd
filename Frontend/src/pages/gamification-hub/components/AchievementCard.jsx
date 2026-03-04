import React from 'react';
import Icon from '../../../components/AppIcon';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

const AchievementCard = ({ 
  achievement, 
  isEarned = false, 
  progress = 0, 
  onClick,
  className = '' 
}) => {
  const { getNavigationClasses } = useAccessibility();

  const progressPercentage = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`
        relative bg-surface border border-border rounded-lg p-4 
        ${isEarned ? 'shadow-md ring-2 ring-success' : 'shadow-sm'}
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${getNavigationClasses('transition-all duration-200')}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${achievement.title} achievement. ${isEarned ? 'Earned' : `${progressPercentage}% complete`}`}
    >
      {/* Achievement Icon */}
      <div className="flex items-start space-x-3">
        <div 
          className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
            ${isEarned 
              ? 'bg-success text-success-foreground' 
              : 'bg-surface-secondary text-text-secondary'
            }
          `}
        >
          <Icon 
            name={achievement.icon} 
            size={24} 
            className={isEarned ? 'text-success-foreground' : 'text-text-secondary'}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Achievement Title */}
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {achievement.title}
          </h3>

          {/* Achievement Description */}
          <p className="text-xs text-text-secondary mb-2 line-clamp-2">
            {achievement.description}
          </p>

          {/* Progress Bar (only for unearned achievements) */}
          {!isEarned && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary">
                  Progress
                </span>
                <span className="text-xs font-medium text-text-primary">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Achievement progress: ${progressPercentage}%`}
                />
              </div>
            </div>
          )}

          {/* Earned Badge */}
          {isEarned && (
            <div className="flex items-center space-x-1 mt-2">
              <Icon name="CheckCircle" size={14} className="text-success" />
              <span className="text-xs font-medium text-success">
                Earned on {achievement.earnedDate}
              </span>
            </div>
          )}

          {/* Points Value */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={14} className="text-warning" />
              <span className="text-xs font-medium text-text-primary">
                {achievement.points} points
              </span>
            </div>

            {/* Difficulty Badge */}
            {achievement.difficulty && (
              <span 
                className={`
                  px-2 py-1 rounded-full text-xs font-medium text-text-primary
                  ${achievement.difficulty === 'easy' ? 'bg-success-200' 
                    : achievement.difficulty === 'medium' ? 'bg-warning-200' : 'bg-error-200'
                  }
                `}
              >
                {achievement.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* New Achievement Indicator */}
      {achievement.isNew && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            New!
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;