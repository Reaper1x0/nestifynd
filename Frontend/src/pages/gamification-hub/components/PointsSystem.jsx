import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

const PointsSystem = ({ 
  currentPoints = 0, 
  recentEarnings = [], 
  availableRewards = [],
  onRedeemReward 
}) => {
  const { getNavigationClasses, effectiveSettings } = useAccessibility();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedReward, setSelectedReward] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'earnings', label: 'Earnings', icon: 'TrendingUp' },
    { id: 'rewards', label: 'Rewards', icon: 'Gift' }
  ];

  const RewardModal = ({ reward, onClose, onRedeem }) => {
    const [redeeming, setRedeeming] = useState(false);
    if (!reward) return null;

    const canAfford = currentPoints >= reward.cost;

    const handleRedeem = async () => {
      if (!canAfford || !onRedeem) return;
      setRedeeming(true);
      try {
        await onRedeem(reward);
        onClose();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to redeem reward');
      } finally {
        setRedeeming(false);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-modal-title"
      >
        <div 
          className="bg-surface rounded-lg p-6 max-w-md w-full shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center">
            {/* Reward Icon */}
            <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <Icon name={reward.icon} size={32} className="text-primary" />
            </div>

            {/* Reward Title */}
            <h2 id="reward-modal-title" className="text-xl font-bold text-text-primary mb-2">
              {reward.title}
            </h2>

            {/* Reward Description */}
            <p className="text-text-secondary mb-4">
              {reward.description}
            </p>

            {/* Cost */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Star" size={20} className="text-warning" />
              <span className="text-lg font-bold text-text-primary">
                {reward.cost} points
              </span>
            </div>

            {/* Availability */}
            <div className="text-sm text-text-secondary mb-6">
              {reward.availability === 'limited' && (
                <span className="text-warning">Limited time offer</span>
              )}
              {reward.availability === 'permanent' && (
                <span>Always available</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={canAfford ? "primary" : "outline"}
                onClick={handleRedeem}
                disabled={!canAfford || redeeming}
                className="flex-1"
              >
                {redeeming ? 'Redeeming...' : (canAfford ? 'Redeem' : 'Not enough points')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-4">
      {/* Current Points Display */}
      <div className="text-center bg-primary-50 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon name="Star" size={32} className="text-primary" />
          <span className="text-3xl font-bold text-primary">
            {currentPoints.toLocaleString()}
          </span>
        </div>
        <p className="text-text-secondary">Total Points</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {recentEarnings.length}
          </div>
          <div className="text-sm text-text-secondary">Recent Activities</div>
        </div>
        <div className="bg-surface-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {availableRewards.filter(r => currentPoints >= r.cost).length}
          </div>
          <div className="text-sm text-text-secondary">Available Rewards</div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">
          Recent Point Earnings
        </h4>
        <div className="space-y-2">
          {recentEarnings.slice(0, 3).map((earning, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Icon name={earning.icon} size={16} className="text-success-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {earning.activity}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {earning.timestamp}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Plus" size={14} className="text-success" />
                <span className="text-sm font-semibold text-success">
                  {earning.points}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EarningsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">
          Point History
        </h4>
        <div className="text-sm text-text-secondary">
          Last 30 days
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recentEarnings.map((earning, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-50 rounded-full flex items-center justify-center">
                <Icon name={earning.icon} size={20} className="text-success" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {earning.activity}
                </div>
                <div className="text-xs text-text-secondary">
                  {earning.description}
                </div>
                <div className="text-xs text-text-tertiary">
                  {earning.timestamp}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Icon name="Plus" size={14} className="text-success" />
                <span className="text-sm font-bold text-success">
                  {earning.points}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RewardsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">
          Available Rewards
        </h4>
        <div className="text-sm text-text-secondary">
          {currentPoints.toLocaleString()} points available
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableRewards.map(reward => {
          const canAfford = currentPoints >= reward.cost;
          
          return (
            <button
              key={reward.id}
              onClick={() => setSelectedReward(reward)}
              className={`
                p-4 rounded-lg border text-left
                ${canAfford 
                  ? 'border-primary bg-primary-50 hover:bg-primary-100' :'border-border bg-surface-secondary opacity-60'
                }
                ${getNavigationClasses('transition-all duration-200')}
              `}
              disabled={!canAfford}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${canAfford ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-secondary'}
                `}>
                  <Icon name={reward.icon} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-text-primary mb-1">
                    {reward.title}
                  </h5>
                  <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-warning" />
                      <span className="text-sm font-bold text-text-primary">
                        {reward.cost}
                      </span>
                    </div>
                    {reward.availability === 'limited' && (
                      <span className="text-xs text-warning font-medium">
                        Limited
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Points & Rewards
        </h3>
        <div className="flex items-center space-x-1 text-primary">
          <Icon name="Star" size={20} />
          <span className="font-bold">{currentPoints.toLocaleString()}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-surface-secondary rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium flex-1
              ${selectedTab === tab.id
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
              }
              ${getNavigationClasses('transition-colors duration-200')}
            `}
            aria-pressed={selectedTab === tab.id}
          >
            <Icon name={tab.icon} size={16} />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {selectedTab === 'overview' && <OverviewTab />}
        {selectedTab === 'earnings' && <EarningsTab />}
        {selectedTab === 'rewards' && <RewardsTab />}
      </div>

      {/* Reward Detail Modal */}
      {selectedReward && (
        <RewardModal 
          reward={selectedReward} 
          onClose={() => setSelectedReward(null)}
          onRedeem={onRedeemReward}
        />
      )}
    </div>
  );
};

export default PointsSystem;