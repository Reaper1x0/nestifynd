import React from 'react';
import Button from '../../../components/ui/Button';

const AuthToggle = ({ isLogin, onToggle, accessibilitySettings }) => {
  return (
    <div
      className={`
        flex gap-2 rounded-xl p-1 mb-6
        bg-surface-secondary border border-border
        ${!accessibilitySettings.reducedMotion ? 'transition-colors duration-200' : ''}
      `}
      role="tablist"
      aria-label="Sign in or register"
    >
      <Button
        variant={isLogin ? 'primary' : 'outline'}
        onClick={() => onToggle(true)}
        className={`
          flex-1 text-sm font-medium py-2.5 px-4 rounded-lg
          ${!isLogin ? 'bg-surface text-text-primary border-border hover:border-primary-200 hover:bg-primary-50 hover:text-primary' : ''}
          ${!accessibilitySettings.reducedMotion ? 'transition-all duration-200' : ''}
          ${accessibilitySettings.highContrast ? 'border-2' : ''}
        `}
        aria-pressed={isLogin}
        aria-label="Switch to login form"
        role="tab"
      >
        Sign In
      </Button>
      <Button
        variant={!isLogin ? 'primary' : 'outline'}
        onClick={() => onToggle(false)}
        className={`
          flex-1 text-sm font-medium py-2.5 px-4 rounded-lg
          ${isLogin ? 'bg-surface text-text-primary border-border hover:border-primary-200 hover:bg-primary-50 hover:text-primary' : ''}
          ${!accessibilitySettings.reducedMotion ? 'transition-all duration-200' : ''}
          ${accessibilitySettings.highContrast ? 'border-2' : ''}
        `}
        aria-pressed={!isLogin}
        aria-label="Switch to registration form"
        role="tab"
      >
        Register
      </Button>
    </div>
  );
};

export default AuthToggle;