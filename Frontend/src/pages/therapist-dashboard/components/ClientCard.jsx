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
    if (!timestamp) return '—';
    try {
      const now = new Date();
      const lastActivity = new Date(timestamp);
      if (isNaN(lastActivity.getTime())) return '—';
      const diffHours = Math.floor((now - lastActivity) / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '—';
    }
  };

  const formatId = (id) => {
    if (!id) return '—';
    const s = String(id);
    return s.length > 10 ? `${s.slice(0, 6)}…` : s;
  };

  return (
    <div
      className={`
        relative p-3 rounded-xl border cursor-pointer min-w-0 overflow-hidden
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
      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary font-semibold text-xs">
                {(client.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            {client.unreadMessages > 0 && (
              <div 
                className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-error text-white text-xs font-semibold"
                aria-label={`${client.unreadMessages} unread message${client.unreadMessages !== 1 ? 's' : ''}`}
              >
                {client.unreadMessages > 99 ? '99+' : client.unreadMessages > 9 ? '9+' : client.unreadMessages}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-primary text-sm truncate">
              {client.name || '—'}
            </h3>
            <p className="text-xs text-text-tertiary truncate font-mono" title={client.id}>
              ID: {formatId(client.id)}
            </p>
          </div>
        </div>
        
        <div className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium border ${getStatusColor(client.status)}`}>
          <Icon 
            name={getStatusIcon(client.status)} 
            size={12} 
            className="inline mr-1" 
          />
          {client.status.replace('-', ' ')}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-2">
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
      <div className="mb-2">
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

    </div>
  );
};

export default ClientCard;