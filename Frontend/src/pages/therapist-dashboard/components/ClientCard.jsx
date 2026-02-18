import React from 'react';
import Icon from '../../../components/AppIcon';


const ClientCard = ({ 
  client, 
  onSelectClient, 
  isSelected, 
  accessibilitySettings 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-success bg-success-50 border-success-200';
      case 'needs-attention':
        return 'text-warning bg-warning-50 border-warning-200';
      case 'active':
        return 'text-primary bg-primary-50 border-primary-200';
      default:
        return 'text-text-secondary bg-surface-secondary border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return 'CheckCircle';
      case 'needs-attention':
        return 'AlertTriangle';
      case 'active':
        return 'Activity';
      default:
        return 'User';
    }
  };

  const formatLastActivity = (timestamp) => {
    const now = new Date();
    const lastActivity = new Date(timestamp);
    const diffHours = Math.floor((now - lastActivity) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg border cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isSelected 
          ? 'bg-primary-50 border-primary-300 shadow-sm' 
          : 'bg-surface border-border hover:border-primary-200'
        }
        ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
        ${accessibilitySettings.highContrast ? 'border-2' : ''}
      `}
      onClick={() => onSelectClient(client)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select client ${client.name}. Status: ${client.status}. Completion rate: ${client.completionRate}%`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectClient(client);
        }
      }}
    >
      {/* Status Indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">
              {client.name}
            </h3>
            <p className="text-xs text-text-secondary">
              ID: {client.id}
            </p>
          </div>
        </div>
        
        <div className={`
          px-2 py-1 rounded-full text-xs font-medium border
          ${getStatusColor(client.status)}
        `}>
          <Icon 
            name={getStatusIcon(client.status)} 
            size={12} 
            className="inline mr-1" 
          />
          {client.status.replace('-', ' ')}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-text-primary">
            {client.completionRate}%
          </div>
          <div className="text-xs text-text-secondary">
            Weekly Rate
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-text-primary">
            {client.currentStreak}
          </div>
          <div className="text-xs text-text-secondary">
            Day Streak
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>Progress</span>
          <span>{client.completionRate}%</span>
        </div>
        <div className="w-full bg-surface-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${client.completionRate}%` }}
            role="progressbar"
            aria-valuenow={client.completionRate}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Completion progress: ${client.completionRate}%`}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex justify-between items-center text-xs text-text-secondary">
        <div className="flex items-center space-x-1">
          <Icon name="Calendar" size={12} />
          <span>{client.missedRoutines} missed</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Clock" size={12} />
          <span>{formatLastActivity(client.lastActivity)}</span>
        </div>
      </div>

      {/* Unread Messages Indicator */}
      {client.unreadMessages > 0 && (
        <div className="absolute -top-2 -right-2 bg-error text-error-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
          {client.unreadMessages > 9 ? '9+' : client.unreadMessages}
        </div>
      )}
    </div>
  );
};

export default ClientCard;