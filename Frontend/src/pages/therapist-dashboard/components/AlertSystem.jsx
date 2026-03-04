import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertSystem = ({ 
  clients, 
  selectedClient, 
  accessibilitySettings 
}) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [alertFilter, setAlertFilter] = useState('all');

  // Generate alerts based on client data
  useEffect(() => {
    const generateAlerts = () => {
      const newAlerts = [];
      
      clients.forEach(client => {
        // Low completion rate alert
        if (client.completionRate < 50) {
          newAlerts.push({
            id: `low-completion-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            type: 'warning',
            category: 'completion',
            title: 'Low Completion Rate',
            message: `${client.name} has a completion rate of ${client.completionRate}% this week`,
            timestamp: client.lastActivity ? new Date(client.lastActivity) : new Date(),
            priority: 'medium',
            actionRequired: true
          });
        }

        // Streak broken alert - had activity before but streak is now 0
        if (client.currentStreak === 0 && client.completionRate > 0) {
          newAlerts.push({
            id: `streak-broken-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            type: 'error',
            category: 'streak',
            title: 'Streak Broken',
            message: `${client.name}'s daily streak was broken`,
            timestamp: client.lastActivity ? new Date(client.lastActivity) : new Date(),
            priority: 'high',
            actionRequired: true
          });
        }

        // Extended absence alert - only when we have valid lastActivity and it's > 3 days ago
        if (client.lastActivity) {
          const lastDate = new Date(client.lastActivity);
          if (!isNaN(lastDate.getTime())) {
            const daysSinceActivity = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceActivity > 3) {
              newAlerts.push({
                id: `absence-${client.id}`,
                clientId: client.id,
                clientName: client.name,
                type: 'warning',
                category: 'activity',
                title: 'Extended Absence',
                message: `${client.name} hasn't been active for ${daysSinceActivity} days`,
                timestamp: lastDate,
                priority: 'high',
                actionRequired: true
              });
            }
          }
        }

        // Unread messages alert
        if (client.unreadMessages > 5) {
          newAlerts.push({
            id: `messages-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            type: 'info',
            category: 'communication',
            title: 'Multiple Unread Messages',
            message: `${client.unreadMessages} unread messages from ${client.name}`,
            timestamp: new Date(),
            priority: 'medium',
            actionRequired: false
          });
        }

        // Excellent progress alert
        if (client.completionRate >= 90 && client.currentStreak >= 7) {
          newAlerts.push({
            id: `excellent-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            type: 'success',
            category: 'achievement',
            title: 'Excellent Progress',
            message: `${client.name} has maintained ${client.completionRate}% completion with a ${client.currentStreak}-day streak`,
            timestamp: client.lastActivity ? new Date(client.lastActivity) : new Date(),
            priority: 'low',
            actionRequired: false
          });
        }
      });

      // Sort by priority and timestamp
      newAlerts.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setAlerts(newAlerts);
    };

    generateAlerts();
  }, [clients]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return 'AlertCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'success':
        return 'CheckCircle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-error bg-error-50 border-error-200';
      case 'warning':
        return 'text-warning bg-warning-50 border-warning-200';
      case 'success':
        return 'text-success bg-success-50 border-success-200';
      case 'info':
        return 'text-primary bg-primary-50 border-primary-200';
      default:
        return 'text-text-secondary bg-surface-secondary border-border';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-error text-error-foreground',
      medium: 'bg-warning text-warning-foreground',
      low: 'bg-success text-success-foreground'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleAlertAction = (alert) => {
    // Handle different alert actions
    switch (alert.category) {
      case 'completion':
      case 'streak': case'activity':
        // Navigate to client details or send message
        console.log(`Taking action for ${alert.category} alert for ${alert.clientName}`);
        break;
      case 'communication':
        // Open messages
        console.log(`Opening messages for ${alert.clientName}`);
        break;
      default:
        break;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (dismissedAlerts.has(alert.id)) return false;
    if (alertFilter === 'all') return true;
    if (alertFilter === 'client' && selectedClient) {
      return alert.clientId === selectedClient.id;
    }
    return alert.type === alertFilter;
  });

  const alertCategories = [
    { value: 'all', label: 'All Alerts', count: filteredAlerts.length },
    { value: 'error', label: 'Critical', count: alerts.filter(a => a.type === 'error' && !dismissedAlerts.has(a.id)).length },
    { value: 'warning', label: 'Warning', count: alerts.filter(a => a.type === 'warning' && !dismissedAlerts.has(a.id)).length },
    { value: 'success', label: 'Positive', count: alerts.filter(a => a.type === 'success' && !dismissedAlerts.has(a.id)).length }
  ];

  if (selectedClient) {
    alertCategories.splice(1, 0, {
      value: 'client',
      label: 'This Client',
      count: alerts.filter(a => a.clientId === selectedClient.id && !dismissedAlerts.has(a.id)).length
    });
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Bell" size={24} className="text-text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Alert System
            </h2>
            <p className="text-sm text-text-secondary">
              {filteredAlerts.length} active alerts
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          iconName="Settings"
          onClick={() => {/* Alert settings */}}
          aria-label="Alert settings"
        />
      </div>

      {/* Alert Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {alertCategories.map((category) => (
          <button
            key={category.value}
            onClick={() => setAlertFilter(category.value)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
              ${alertFilter === category.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
              }
              ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
            `}
            aria-pressed={alertFilter === category.value}
          >
            <span>{category.label}</span>
            {category.count > 0 && (
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${alertFilter === category.value
                  ? 'bg-primary-foreground text-primary'
                  : 'bg-surface text-text-tertiary'
                }
              `}>
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Icon name="CheckCircle" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No active alerts</p>
            <p className="text-sm mt-1">All clients are performing well!</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`
                border rounded-lg p-4 transition-all duration-200
                ${getAlertColor(alert.type)}
                ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
              `}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon 
                    name={getAlertIcon(alert.type)} 
                    size={20} 
                    className="mt-0.5 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-sm">
                        {alert.title}
                      </h3>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    
                    <p className="text-sm opacity-90 mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-75">
                        {alert.timestamp && !isNaN(new Date(alert.timestamp).getTime())
                          ? new Date(alert.timestamp).toLocaleString()
                          : '—'}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        {alert.actionRequired && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="ExternalLink"
                            onClick={() => handleAlertAction(alert)}
                            className="text-xs"
                          >
                            Take Action
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="X"
                          onClick={() => handleDismissAlert(alert.id)}
                          aria-label="Dismiss alert"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-error">
                {alerts.filter(a => a.type === 'error' && !dismissedAlerts.has(a.id)).length}
              </div>
              <div className="text-xs text-text-secondary">Critical</div>
            </div>
            <div>
              <div className="text-lg font-bold text-warning">
                {alerts.filter(a => a.type === 'warning' && !dismissedAlerts.has(a.id)).length}
              </div>
              <div className="text-xs text-text-secondary">Warning</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {alerts.filter(a => a.actionRequired && !dismissedAlerts.has(a.id)).length}
              </div>
              <div className="text-xs text-text-secondary">Action Needed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">
                {alerts.filter(a => a.type === 'success' && !dismissedAlerts.has(a.id)).length}
              </div>
              <div className="text-xs text-text-secondary">Positive</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;