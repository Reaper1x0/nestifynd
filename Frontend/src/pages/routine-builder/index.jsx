import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import all components
import RoutineBasicInfo from './components/RoutineBasicInfo';
import ScheduleSettings from './components/ScheduleSettings';
import TaskManager from './components/TaskManager';
import ReminderSettings from './components/ReminderSettings';
import TemplateSelector from './components/TemplateSelector';
import ProgressIndicator from './components/ProgressIndicator';
import LivePreview from './components/LivePreview';

const RoutineBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    schedule: false,
    tasks: false,
    reminders: false
  });
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    category: 'daily',
    color: '#4F46E5',
    icon: 'Calendar',
    
    // Schedule
    frequency: 'daily',
    time: '09:00',
    duration: 30,
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    timeFlexibility: 15,
    autoReschedule: false,
    
    // Tasks
    tasks: [],
    allowPartialCompletion: false,
    requireAllTasks: true,
    
    // Reminders
    enableReminders: true,
    reminderTypes: ['visual', 'audio'],
    reminderTiming: [
      { type: 'before', minutes: 15, enabled: true },
      { type: 'at', minutes: 0, enabled: true },
      { type: 'after', minutes: 5, enabled: false }
    ],
    escalationEnabled: false,
    escalationSteps: [
      { delay: 5, type: 'visual', intensity: 'normal' },
      { delay: 10, type: 'audio', intensity: 'high' },
      { delay: 15, type: 'caregiver', intensity: 'urgent' }
    ],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    customMessage: '',
    snoozeOptions: {
      enabled: true,
      durations: [5, 10, 15, 30],
      maxSnoozes: 3
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  const totalSteps = 4;
  const sectionKeys = ['basic', 'schedule', 'tasks', 'reminders'];

  // Load accessibility settings
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setAccessibilitySettings({
      reducedMotion,
      highContrast,
      fontSize: 'medium'
    });
  }, []);

  // Check if editing existing routine
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const routineId = params.get('edit');
    
    if (routineId) {
      // In a real app, load routine data from API
      // For now, we'll simulate loading an existing routine
      setIsLoading(true);
      setTimeout(() => {
        // Mock existing routine data
        const existingRoutine = {
          name: 'Morning Routine',
          description: 'Start the day with energy and focus',
          category: 'morning',
          color: '#10B981',
          icon: 'Sunrise',
          frequency: 'daily',
          time: '07:00',
          duration: 45,
          tasks: [
            {
              id: '1',
              name: 'Stretch and wake up',
              description: 'Light stretching to activate muscles',
              estimatedTime: 5,
              isRequired: true,
              hasVoicePrompt: false,
              completionCriteria: 'manual'
            },
            {
              id: '2',
              name: 'Brush teeth',
              description: 'Morning dental hygiene',
              estimatedTime: 3,
              isRequired: true,
              hasVoicePrompt: false,
              completionCriteria: 'manual'
            }
          ]
        };
        setFormData(prev => ({ ...prev, ...existingRoutine }));
        setIsLoading(false);
      }, 1000);
    }
  }, [location.search]);

  const validateSection = (sectionKey) => {
    const newErrors = {};
    
    switch (sectionKey) {
      case 'basic':
        if (!formData.name.trim()) {
          newErrors.name = 'Routine name is required';
        }
        if (!formData.category) {
          newErrors.category = 'Please select a category';
        }
        break;
        
      case 'schedule':
        if (!formData.frequency) {
          newErrors.frequency = 'Please select a frequency';
        }
        if (!formData.time) {
          newErrors.time = 'Please set a time';
        }
        if (!formData.duration || formData.duration < 5) {
          newErrors.duration = 'Duration must be at least 5 minutes';
        }
        break;
        
      case 'tasks':
        if (formData.tasks.length === 0) {
          newErrors.tasks = 'Please add at least one task';
        }
        break;
        
      case 'reminders':
        if (formData.enableReminders && formData.reminderTypes.length === 0) {
          newErrors.reminders = 'Please select at least one reminder type';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionUpdate = (sectionKey, data) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    // Clear errors for this section
    const sectionErrors = Object.keys(errors).filter(key => 
      key.startsWith(sectionKey) || 
      (sectionKey === 'basic' && ['name', 'category'].includes(key)) ||
      (sectionKey === 'schedule' && ['frequency', 'time', 'duration'].includes(key)) ||
      (sectionKey === 'tasks' && key === 'tasks') ||
      (sectionKey === 'reminders' && key === 'reminders')
    );
    
    if (sectionErrors.length > 0) {
      const updatedErrors = { ...errors };
      sectionErrors.forEach(key => delete updatedErrors[key]);
      setErrors(updatedErrors);
    }
  };

  const handleSectionToggle = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleTemplateSelect = (template) => {
    const templateData = {
      name: template.name,
      description: template.description,
      category: template.category,
      color: template.color,
      icon: template.icon,
      duration: template.duration,
      tasks: template.tasks_preview.map((taskName, index) => ({
        id: `template-${index}`,
        name: taskName,
        description: '',
        estimatedTime: Math.ceil(template.duration / template.tasks_preview.length),
        isRequired: true,
        hasVoicePrompt: false,
        completionCriteria: 'manual'
      }))
    };
    
    setFormData(prev => ({ ...prev, ...templateData }));
    setShowTemplateSelector(false);
    
    // Expand basic info section
    setExpandedSections(prev => ({ ...prev, basic: true }));
  };

  const handleNext = () => {
    const currentSectionKey = sectionKeys[currentStep];
    if (validateSection(currentSectionKey)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
        // Expand next section
        const nextSectionKey = sectionKeys[currentStep + 1];
        setExpandedSections(prev => ({
          ...prev,
          [currentSectionKey]: false,
          [nextSectionKey]: true
        }));
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      // Expand previous section
      const prevSectionKey = sectionKeys[currentStep - 1];
      const currentSectionKey = sectionKeys[currentStep];
      setExpandedSections(prev => ({
        ...prev,
        [currentSectionKey]: false,
        [prevSectionKey]: true
      }));
    }
  };

  const handleSave = async (isDraft = false) => {
    // Validate all sections
    let isValid = true;
    sectionKeys.forEach(sectionKey => {
      if (!validateSection(sectionKey)) {
        isValid = false;
      }
    });

    if (!isValid && !isDraft) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, save to backend
      console.log('Saving routine:', formData);
      
      // Show success message and navigate
      navigate('/home-dashboard', { 
        state: { 
          message: `Routine "${formData.name}" ${isDraft ? 'saved as draft' : 'created successfully'}!`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error saving routine:', error);
      setErrors({ general: 'Failed to save routine. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (Object.keys(formData).some(key => formData[key] !== '' && formData[key] !== false && !Array.isArray(formData[key]))) {
      if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
        navigate('/home-dashboard');
      }
    } else {
      navigate('/home-dashboard');
    }
  };

  const getCompletedSections = () => {
    const completed = [];
    sectionKeys.forEach(sectionKey => {
      if (validateSection(sectionKey)) {
        completed.push(sectionKey);
      }
    });
    return completed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading routine builder...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation />
      
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
          <button 
            onClick={() => navigate('/home-dashboard')}
            className="hover:text-text-primary transition-colors duration-200"
          >
            Dashboard
          </button>
          <Icon name="ChevronRight" size={16} />
          <button 
            onClick={() => navigate('/routine-builder')}
            className="hover:text-text-primary transition-colors duration-200"
          >
            Routines
          </button>
          <Icon name="ChevronRight" size={16} />
          <span className="text-text-primary">Create New Routine</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Indicator */}
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSections={getCompletedSections()}
              accessibilitySettings={accessibilitySettings}
            />

            {/* Template Selector Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowTemplateSelector(true)}
                iconName="Template"
                iconPosition="left"
              >
                Choose from Template
              </Button>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={20} className="text-error" />
                  <p className="text-error font-medium">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Form Sections */}
            <div className="space-y-4">
              <RoutineBasicInfo
                formData={formData}
                onUpdate={(data) => handleSectionUpdate('basic', data)}
                isExpanded={expandedSections.basic}
                onToggle={() => handleSectionToggle('basic')}
                errors={errors}
                accessibilitySettings={accessibilitySettings}
              />

              <ScheduleSettings
                formData={formData}
                onUpdate={(data) => handleSectionUpdate('schedule', data)}
                isExpanded={expandedSections.schedule}
                onToggle={() => handleSectionToggle('schedule')}
                errors={errors}
                accessibilitySettings={accessibilitySettings}
              />

              <TaskManager
                formData={formData}
                onUpdate={(data) => handleSectionUpdate('tasks', data)}
                isExpanded={expandedSections.tasks}
                onToggle={() => handleSectionToggle('tasks')}
                errors={errors}
                accessibilitySettings={accessibilitySettings}
              />

              <ReminderSettings
                formData={formData}
                onUpdate={(data) => handleSectionUpdate('reminders', data)}
                isExpanded={expandedSections.reminders}
                onToggle={() => handleSectionToggle('reminders')}
                errors={errors}
                accessibilitySettings={accessibilitySettings}
              />
            </div>
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Preview</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  iconName={showLivePreview ? 'EyeOff' : 'Eye'}
                  aria-label={showLivePreview ? 'Hide preview' : 'Show preview'}
                />
              </div>
              
              <LivePreview
                formData={formData}
                isVisible={showLivePreview}
                accessibilitySettings={accessibilitySettings}
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Buttons */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-4 mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Previous
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => handleSave(true)}
                disabled={isLoading}
                iconName="Save"
                iconPosition="left"
              >
                Save Draft
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleSave(false)}
                  disabled={isLoading}
                  loading={isLoading}
                  iconName="Check"
                  iconPosition="left"
                >
                  Create Routine
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Template Selector Modal */}
      <TemplateSelector
        isVisible={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onTemplateSelect={handleTemplateSelect}
        accessibilitySettings={accessibilitySettings}
      />
    </div>
  );
};

export default RoutineBuilder;