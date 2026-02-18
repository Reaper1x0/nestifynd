import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = ({ userName: userNameProp }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const userName = userNameProp || 'there';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const mockWeather = {
    temperature: 72,
    condition: "Sunny",
    icon: "Sun"
  };

  return (
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-6 border border-primary-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-2">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            {formatDate(currentTime)}
          </p>
          <p className="text-text-tertiary text-sm">
            {formatTime(currentTime)}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-surface rounded-lg p-3 shadow-sm border border-border">
            <div className="flex items-center space-x-2">
              <Icon name={mockWeather.icon} size={24} className="text-warning" />
              <div>
                <p className="text-lg font-medium text-text-primary">
                  {mockWeather.temperature}°F
                </p>
                <p className="text-xs text-text-secondary">
                  {mockWeather.condition}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;