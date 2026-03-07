import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const QuickActions = () => {
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [newAchievements, setNewAchievements] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [messagesRes, progressRes] = await Promise.all([
          axiosClient.get('/api/messages/unread-count').catch(() => ({ data: { unreadCount: 0 } })),
          axiosClient.get('/api/gamification/progress').catch(() => ({ data: { newAchievementsCount: 0 } }))
        ]);
        
        setUnreadMessages(messagesRes.data?.unreadCount || 0);
        setNewAchievements(progressRes.data?.newAchievementsCount || 0);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const quickActions = [
    {
      id: 1,
      title: 'Add Routine',
      description: 'Create a new daily routine',
      icon: 'Plus',
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      action: () => navigate('/routine-builder'),
      badge: null
    },
    {
      id: 2,
      title: 'View Calendar',
      description: 'See your schedule overview',
      icon: 'Calendar',
      color: 'text-secondary',
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
      action: () => navigate('/routine-builder'),
      badge: null
    },
    {
      id: 3,
      title: 'Messages',
      description: 'Check caregiver messages',
      icon: 'MessageCircle',
      color: 'text-success',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      action: () => navigate('/messages'),
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    {
      id: 4,
      title: 'Progress',
      description: 'View achievements & stats',
      icon: 'Trophy',
      color: 'text-warning',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      action: () => navigate('/gamification-hub'),
      badge: newAchievements > 0 ? newAchievements : null
    },
    {
      id: 5,
      title: 'Settings',
      description: 'Customize accessibility',
      icon: 'Settings',
      color: 'text-text-secondary',
      bgColor: 'bg-surface-secondary',
      borderColor: 'border-border',
      action: () => navigate('/settings-accessibility'),
      badge: null
    },
    {
      id: 6,
      title: 'Emergency',
      description: 'Quick access to help',
      icon: 'Phone',
      color: 'text-error',
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200',
      action: () => {},
      badge: null
    }
  ];

  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <Icon name="Zap" size={24} className="mr-2 text-primary" />
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`
              relative group p-4 rounded-lg border transition-all duration-200
              ${action.bgColor} ${action.borderColor}
              hover:shadow-md hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              min-h-[100px] flex flex-col items-center justify-center text-center
            `}
            aria-label={`${action.title}: ${action.description}`}
          >
            {action.badge && (
              <span className="absolute -top-2 -right-2 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {action.badge > 9 ? '9+' : action.badge}
              </span>
            )}
            
            <div className={`w-12 h-12 shrink-0 rounded-full bg-surface flex items-center justify-center mb-3 border ${action.borderColor} group-hover:scale-110 transition-transform`}>
              <Icon 
                name={action.icon} 
                size={24} 
                className={action.color}
              />
            </div>
            
            <h3 className="text-sm font-medium text-text-primary mb-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {action.title}
            </h3>
            
            <p className="text-xs text-text-secondary leading-snug w-full line-clamp-2">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      {/* Emergency Contact Section */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error rounded-full flex items-center justify-center">
                <Icon name="Phone" size={20} className="text-error-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  Emergency Contact
                </h3>
                <p className="text-xs text-text-secondary">
                  Available 24/7 for immediate support
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              iconName="Phone"
              iconPosition="left"
              onClick={() => {}}
              className="min-w-[44px] min-h-[44px]"
            >
              Call Now
            </Button>
          </div>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-primary mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-1">
              Daily Tip
            </h3>
            <p className="text-xs text-text-secondary">
              Try completing your morning routine within the first hour of waking up to build stronger habits and improve your daily momentum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;