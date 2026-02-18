import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  completedSections = [],
  accessibilitySettings = {}
}) => {
  const steps = [
    { id: 'basic', name: 'Basic Info', icon: 'Info' },
    { id: 'schedule', name: 'Schedule', icon: 'Clock' },
    { id: 'tasks', name: 'Tasks', icon: 'CheckSquare' },
    { id: 'reminders', name: 'Reminders', icon: 'Bell' }
  ];

  const getStepStatus = (stepIndex) => {
    const stepId = steps[stepIndex].id;
    if (completedSections.includes(stepId)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return 'completed';
    return 'pending';
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground border-success';
      case 'current':
        return 'bg-primary text-primary-foreground border-primary';
      case 'pending':
        return 'bg-surface-secondary text-text-secondary border-border';
      default:
        return 'bg-surface-secondary text-text-secondary border-border';
    }
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="bg-surface rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Create New Routine
        </h2>
        <div className="text-sm text-text-secondary">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">Progress</span>
          <span className="text-sm text-text-secondary">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-surface-secondary rounded-full h-2">
          <div 
            className={`
              h-2 rounded-full transition-all duration-300 bg-primary
              ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
            `}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Form completion progress: ${Math.round(progressPercentage)}%`}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200
                    ${getStepClasses(status)}
                    ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                  `}
                  role="img"
                  aria-label={`${step.name} - ${status}`}
                >
                  {status === 'completed' ? (
                    <Icon name="Check" size={20} />
                  ) : (
                    <Icon name={step.icon} size={20} />
                  )}
                </div>
                <span 
                  className={`
                    text-xs font-medium mt-2 text-center
                    ${status === 'current' ? 'text-primary' : 
                      status === 'completed' ? 'text-success' : 'text-text-secondary'}
                  `}
                >
                  {step.name}
                </span>
              </div>
              
              {!isLast && (
                <div 
                  className={`
                    flex-1 h-0.5 mx-4 transition-all duration-200
                    ${index < currentStep ? 'bg-success' : 'bg-surface-secondary'}
                    ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                  `}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Description */}
      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
        <p className="text-sm text-primary">
          {currentStep === 0 && "Start by providing basic information about your routine."}
          {currentStep === 1 && "Set up when and how often this routine should occur."}
          {currentStep === 2 && "Add specific tasks that make up this routine."}
          {currentStep === 3 && "Configure reminders and notifications for this routine."}
        </p>
      </div>

      {/* Accessibility Status for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite">
        Currently on step {currentStep + 1} of {totalSteps}: {steps[currentStep]?.name}
      </div>
    </div>
  );
};

export default ProgressIndicator;