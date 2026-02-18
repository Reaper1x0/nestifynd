import React from 'react';
import Icon from '../../../components/AppIcon';

const LoadingSpinner = ({ accessibilitySettings }) => {
  return (
    <div 
      className="flex items-center justify-center py-8"
      role="status"
      aria-label="Loading authentication"
    >
      <div className="flex flex-col items-center space-y-3">
        <div 
          className={`
            ${!accessibilitySettings.reducedMotion ? 'animate-spin' : ''}
            text-primary
          `}
        >
          <Icon name="Loader2" size={32} />
        </div>
        <p className="text-sm text-text-secondary font-medium">
          Authenticating...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;