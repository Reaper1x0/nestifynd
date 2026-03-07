import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

const ChallengeCards = ({ 
  challenges = [], 
  activeChallenges = [],
  onJoinChallenge,
  onLeaveChallenge 
}) => {
  const { getNavigationClasses, effectiveSettings } = useAccessibility();
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    if (selectedChallenge) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const prevOverflow = document.body.style.overflow;
      const prevPadding = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPadding;
      };
    }
  }, [selectedChallenge]);

  const difficulties = [
    { id: 'all', label: 'All Levels', icon: 'Grid3x3' },
    { id: 'easy', label: 'Easy', icon: 'Smile', color: 'success' },
    { id: 'medium', label: 'Medium', icon: 'Zap', color: 'warning' },
    { id: 'hard', label: 'Hard', icon: 'Flame', color: 'error' }
  ];

  const filteredChallenges = selectedDifficulty === 'all' 
    ? challenges 
    : challenges.filter(challenge => challenge.difficulty === selectedDifficulty);

  const isActive = (challengeId) => {
    return activeChallenges.some(active => active.id === challengeId);
  };

  const getProgress = (challengeId) => {
    const active = activeChallenges.find(active => active.id === challengeId);
    return active ? active.progress : 0;
  };

  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      easy: 'text-success bg-success-50 border-success-200',
      medium: 'text-warning bg-warning-50 border-warning-200',
      hard: 'text-error bg-error-50 border-error-200'
    };
    return colorMap[difficulty] || 'text-text-secondary bg-surface-secondary border-border';
  };

  const ChallengeModal = ({ challenge, onClose }) => {
    if (!challenge) return null;

    const active = isActive(challenge.id);
    const progress = getProgress(challenge.id);

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[200] p-4 overflow-y-auto flex justify-center pt-20"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-modal-title"
      >
        <div 
          className="bg-surface rounded-lg p-6 max-w-md w-full shadow-xl mt-8 mb-8 shrink-0"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${getDifficultyColor(challenge.difficulty)}
              `}>
                <Icon name={challenge.icon} size={24} />
              </div>
              <div>
                <h2 id="challenge-modal-title" className="text-lg font-bold text-text-primary">
                  {challenge.title}
                </h2>
                <span className={`
                  inline-block px-2 py-1 rounded-full text-xs font-medium border
                  ${getDifficultyColor(challenge.difficulty)}
                `}>
                  {challenge.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-secondary rounded"
              aria-label="Close modal"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Description */}
          <p className="text-text-secondary mb-4">
            {challenge.description}
          </p>

          {/* Challenge Details */}
          <div className="space-y-4 mb-6">
            {/* Duration */}
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Duration:</span>
              <span className="text-sm font-medium text-text-primary">
                {challenge.duration}
              </span>
            </div>

            {/* Reward */}
            <div className="flex items-center space-x-2">
              <Icon name="Star" size={16} className="text-warning" />
              <span className="text-sm text-text-secondary">Reward:</span>
              <span className="text-sm font-medium text-text-primary">
                {challenge.reward} points
              </span>
            </div>

            {/* Participants */}
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Participants:</span>
              <span className="text-sm font-medium text-text-primary">
                {challenge.participants} joined
              </span>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              Requirements:
            </h3>
            <ul className="space-y-1">
              {challenge.requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress (if active) */}
          {active && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">Progress</span>
                <span className="text-sm text-text-secondary">{progress}%</span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            {active ? (
              <Button
                variant="danger"
                onClick={() => {
                  onLeaveChallenge(challenge.id);
                  onClose();
                }}
                className="flex-1"
              >
                Leave Challenge
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  onJoinChallenge(challenge.id);
                  onClose();
                }}
                className="flex-1"
              >
                Join Challenge
              </Button>
            )}
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
          Weekly Challenges
        </h3>
        <div className="text-sm text-text-secondary">
          {activeChallenges.length} active
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {difficulties.map(difficulty => (
          <button
            key={difficulty.id}
            onClick={() => setSelectedDifficulty(difficulty.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium border
              ${selectedDifficulty === difficulty.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface-secondary text-text-secondary border-border hover:text-text-primary'
              }
              ${getNavigationClasses('transition-colors duration-200')}
            `}
            aria-pressed={selectedDifficulty === difficulty.id}
          >
            <Icon name={difficulty.icon} size={16} />
            <span>{difficulty.label}</span>
          </button>
        ))}
      </div>

      {/* Challenge Cards */}
      <div className="space-y-3">
        {filteredChallenges.map(challenge => {
          const active = isActive(challenge.id);
          const progress = getProgress(challenge.id);

          return (
            <div
              key={challenge.id}
              className={`
                relative border rounded-lg p-4
                ${active 
                  ? 'border-primary bg-primary-50' :'border-border bg-surface-secondary hover:bg-surface-tertiary'
                }
                ${getNavigationClasses('transition-all duration-200')}
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Challenge Icon */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                  ${getDifficultyColor(challenge.difficulty)}
                `}>
                  <Icon name={challenge.icon} size={24} />
                </div>

                {/* Challenge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-1">
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium border ml-2 flex-shrink-0
                      ${getDifficultyColor(challenge.difficulty)}
                    `}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  {/* Challenge Stats */}
                  <div className="flex items-center space-x-4 text-xs text-text-secondary mb-3">
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{challenge.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={12} className="text-warning" />
                      <span>{challenge.reward} pts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={12} />
                      <span>{challenge.participants}</span>
                    </div>
                  </div>

                  {/* Progress Bar (if active) */}
                  {active && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-text-secondary">Progress</span>
                        <span className="text-xs font-medium text-text-primary">{progress}%</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChallenge(challenge)}
                      iconName="Eye"
                      iconPosition="left"
                    >
                      Details
                    </Button>
                    {active ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onLeaveChallenge(challenge.id)}
                        iconName="X"
                        iconPosition="left"
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onJoinChallenge(challenge.id)}
                        iconName="Plus"
                        iconPosition="left"
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* New Challenge Indicator */}
              {challenge.isNew && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full font-medium">
                    New!
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Target" size={48} className="text-text-tertiary mx-auto mb-2" />
          <p className="text-text-secondary">No challenges available for this difficulty level.</p>
        </div>
      )}

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <ChallengeModal 
          challenge={selectedChallenge} 
          onClose={() => setSelectedChallenge(null)} 
        />
      )}
    </div>
  );
};

export default ChallengeCards;