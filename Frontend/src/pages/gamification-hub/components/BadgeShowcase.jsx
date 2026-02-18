import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

const BadgeShowcase = ({ badges, earnedBadges = [] }) => {
  const { getNavigationClasses, effectiveSettings } = useAccessibility();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const categories = [
    { id: 'all', label: 'All Badges', icon: 'Grid3x3' },
    { id: 'streak', label: 'Streaks', icon: 'Flame' },
    { id: 'completion', label: 'Completion', icon: 'CheckCircle' },
    { id: 'milestone', label: 'Milestones', icon: 'Trophy' },
    { id: 'special', label: 'Special', icon: 'Star' }
  ];

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const isBadgeEarned = (badgeId) => {
    return earnedBadges.some(earned => earned.id === badgeId);
  };

  const getBadgeProgress = (badgeId) => {
    const earned = earnedBadges.find(earned => earned.id === badgeId);
    return earned ? earned.progress || 100 : 0;
  };

  const BadgeModal = ({ badge, onClose }) => {
    if (!badge) return null;

    const isEarned = isBadgeEarned(badge.id);
    const progress = getBadgeProgress(badge.id);

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-modal-title"
      >
        <div 
          className="bg-surface rounded-lg p-6 max-w-md w-full shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center">
            {/* Badge Icon */}
            <div 
              className={`
                w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
                ${isEarned 
                  ? 'bg-success text-success-foreground' 
                  : 'bg-surface-secondary text-text-secondary'
                }
              `}
            >
              <Icon name={badge.icon} size={40} />
            </div>

            {/* Badge Title */}
            <h2 id="badge-modal-title" className="text-xl font-bold text-text-primary mb-2">
              {badge.title}
            </h2>

            {/* Badge Description */}
            <p className="text-text-secondary mb-4">
              {badge.description}
            </p>

            {/* Requirements */}
            <div className="text-left mb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                Requirements:
              </h3>
              <ul className="text-sm text-text-secondary space-y-1">
                {badge.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress */}
            {!isEarned && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">Progress</span>
                  <span className="text-sm font-medium text-text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Earned Status */}
            {isEarned && (
              <div className="flex items-center justify-center space-x-2 mb-4 text-success">
                <Icon name="CheckCircle" size={20} />
                <span className="font-medium">Badge Earned!</span>
              </div>
            )}

            {/* Points */}
            <div className="flex items-center justify-center space-x-1 mb-4">
              <Icon name="Star" size={16} className="text-warning" />
              <span className="text-sm font-medium text-text-primary">
                {badge.points} points
              </span>
            </div>

            {/* Close Button */}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Badge Collection
        </h3>
        <div className="text-sm text-text-secondary">
          {earnedBadges.length} of {badges.length} earned
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
              ${selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
              }
              ${getNavigationClasses('transition-colors duration-200')}
            `}
            aria-pressed={selectedCategory === category.id}
          >
            <Icon name={category.icon} size={16} />
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredBadges.map(badge => {
          const isEarned = isBadgeEarned(badge.id);
          const progress = getBadgeProgress(badge.id);

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`
                relative p-3 rounded-lg border text-center
                ${isEarned 
                  ? 'border-success bg-success-50 shadow-md' 
                  : 'border-border bg-surface-secondary hover:bg-surface-tertiary'
                }
                ${getNavigationClasses('transition-all duration-200')}
              `}
              aria-label={`${badge.title} badge. ${isEarned ? 'Earned' : `${progress}% progress`}`}
            >
              {/* Badge Icon */}
              <div 
                className={`
                  w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2
                  ${isEarned 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-surface text-text-secondary'
                  }
                `}
              >
                <Icon name={badge.icon} size={24} />
              </div>

              {/* Badge Title */}
              <h4 className={`
                text-xs font-medium mb-1 line-clamp-2
                ${isEarned ? 'text-success-700' : 'text-text-primary'}
              `}>
                {badge.title}
              </h4>

              {/* Progress Bar for Unearned Badges */}
              {!isEarned && progress > 0 && (
                <div className="w-full bg-surface rounded-full h-1 mb-1">
                  <div
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Points */}
              <div className="flex items-center justify-center space-x-1">
                <Icon name="Star" size={12} className="text-warning" />
                <span className="text-xs text-text-secondary">{badge.points}</span>
              </div>

              {/* New Badge Indicator */}
              {badge.isNew && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              )}

              {/* Earned Checkmark */}
              {isEarned && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <Icon name="Check" size={12} className="text-success-foreground" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Award" size={48} className="text-text-tertiary mx-auto mb-2" />
          <p className="text-text-secondary">No badges in this category yet.</p>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeModal 
          badge={selectedBadge} 
          onClose={() => setSelectedBadge(null)} 
        />
      )}
    </div>
  );
};

export default BadgeShowcase;