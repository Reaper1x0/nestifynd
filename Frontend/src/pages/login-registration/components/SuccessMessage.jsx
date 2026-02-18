import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessMessage = ({ message, onContinue, accessibilitySettings }) => {
  return (
    <div 
      className="text-center py-8"
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-4">
        <div 
          className={`
            w-16 h-16 bg-success-100 rounded-full flex items-center justify-center
            ${!accessibilitySettings.reducedMotion ? 'animate-scale-in' : ''}
          `}
        >
          <Icon name="CheckCircle" size={32} className="text-success" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">
            Welcome to NestifyND!
          </h3>
          <p className="text-sm text-text-secondary max-w-sm">
            {message}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onContinue}
          className="min-h-[44px] px-8"
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SuccessMessage;