import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

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
    selectedTemplateId: null, // set when user picks a template (backend template _id)
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

  const params = new URLSearchParams(location.search);
  const clientId = params.get('clientId');
  const returnPath = params.get('returnTo') || (clientId ? '/therapist-dashboard' : '/home-dashboard');

  const isMongoObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[a-fA-F0-9]{24}$/.test(id);
  };

  const [aiRoutineLoaded, setAiRoutineLoaded] = useState(false);

  // Prefill from AI-suggested routine (e.g. from /ai-routine)
  useEffect(() => {
    const suggested = location.state?.suggestedRoutine;
    if (suggested && !params.get('edit')) {
      const tasks = Array.isArray(suggested.tasks) ? suggested.tasks : [];
      setFormData((prev) => ({
        ...prev,
        name: suggested.name || prev.name,
        description: suggested.description || prev.description,
        time: prev.time,
        tasks: tasks.map((t, i) => ({
          id: t.id || `ai-${i}`,
          name: t.name || `Task ${i + 1}`,
          description: t.description || '',
          estimatedTime: t.estimatedDuration ?? t.durationMinutes ?? 15,
          isRequired: true,
          hasVoicePrompt: false,
          completionCriteria: 'manual',
        })),
        _originalTaskIds: [],
      }));
      // Expand all sections to show the prefilled data
      setExpandedSections({
        basic: true,
        schedule: true,
        tasks: true,
        reminders: false
      });
      setAiRoutineLoaded(true);
      // Clear after 5 seconds
      setTimeout(() => setAiRoutineLoaded(false), 5000);
      window.history.replaceState({}, '', location.pathname + location.search);
    }
  }, [location.state?.suggestedRoutine]);

  // Check if editing existing routine
  useEffect(() => {
    const routineId = params.get('edit');

    if (routineId) {
      setIsLoading(true);
      (async () => {
        try {
          let r;
          let taskList = [];
          if (clientId) {
            const rRes = await axiosClient.get(`/api/routines/user/${clientId}/${routineId}`);
            r = rRes.data;
            taskList = Array.isArray(r.tasks) ? r.tasks : [];
          } else {
            const [rRes, tRes] = await Promise.all([
              axiosClient.get(`/api/routines/${routineId}`),
              axiosClient.get(`/api/tasks?routine=${routineId}`).catch(() => ({ data: [] })),
            ]);
            r = rRes.data;
            taskList = Array.isArray(tRes.data) ? tRes.data : [];
          }
          setFormData((prev) => ({
            ...prev,
            name: r.title || r.name || '',
            description: r.description || '',
            category: prev.category,
            color: prev.color,
            icon: prev.icon,
            frequency: r.schedule?.isRecurring !== false ? 'daily' : 'daily',
            time: r.schedule?.startTime || '09:00',
            duration: 30,
            daysOfWeek: r.schedule?.daysOfWeek?.length ? r.schedule.daysOfWeek : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            tasks: taskList.map((t) => ({
              id: t._id,
              name: t.name,
              description: t.description || '',
              estimatedTime: t.estimatedDuration || 15,
              isRequired: true,
              hasVoicePrompt: false,
              completionCriteria: t.completionCriteria || 'manual',
            })),
            _originalTaskIds: taskList.map((t) => t._id),
            allowPartialCompletion: r.settings?.allowSnooze !== false,
            requireAllTasks: r.settings?.allowDismiss !== false,
          }));
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [location.search, clientId]);

  // Pure check only (no setState). Use for render-time completion display.
  const isSectionValid = (sectionKey) => {
    const data = formData || {};
    switch (sectionKey) {
      case 'basic':
        return Boolean(data.name?.trim() && data.category);
      case 'schedule':
        return Boolean(data.frequency && data.time && (data.duration == null || data.duration >= 5));
      case 'tasks':
        return Array.isArray(data.tasks) && data.tasks.length > 0;
      case 'reminders':
        return !data.enableReminders || (Array.isArray(data.reminderTypes) && data.reminderTypes.length > 0);
      default:
        return false;
    }
  };

  const validateSection = (sectionKey) => {
    const newErrors = {};
    const data = formData || {};
    
    switch (sectionKey) {
      case 'basic':
        if (!(data.name || '').trim()) {
          newErrors.name = 'Routine name is required';
        }
        if (!data.category) {
          newErrors.category = 'Please select a category';
        }
        break;
        
      case 'schedule':
        if (!data.frequency) {
          newErrors.frequency = 'Please select a frequency';
        }
        if (!data.time) {
          newErrors.time = 'Please set a time';
        }
        if (!data.duration || data.duration < 5) {
          newErrors.duration = 'Duration must be at least 5 minutes';
        }
        break;
        
      case 'tasks':
        if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
          newErrors.tasks = 'Please add at least one task';
        }
        break;
        
      case 'reminders':
        if (data.enableReminders && (!Array.isArray(data.reminderTypes) || data.reminderTypes.length === 0)) {
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
    const tasksPreview = template.tasks_preview || (template.tasks || []).map(t => (typeof t === 'string' ? t : t.name));
    const duration = template.duration || (template.tasks || []).reduce((sum, t) => sum + (t.durationMinutes || 0), 0) || 30;
    const templateData = {
      name: template.name,
      description: template.description || '',
      category: template.category || 'daily',
      color: template.color || '#4F46E5',
      icon: template.icon || 'Calendar',
      duration: duration,
      tasks: tasksPreview.map((taskName, index) => ({
        id: `template-${index}`,
        name: typeof taskName === 'string' ? taskName : taskName.name,
        description: '',
        estimatedTime: duration && tasksPreview.length ? Math.ceil(duration / tasksPreview.length) : 15,
        isRequired: true,
        hasVoicePrompt: false,
        completionCriteria: 'manual'
      })),
      selectedTemplateId: template._id || null
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
    let isValid = true;
    sectionKeys.forEach((sectionKey) => {
      if (!validateSection(sectionKey)) isValid = false;
    });
    if (!isValid && !isDraft) return;

    setIsLoading(true);
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');

    try {
      const routinePayload = {
        title: formData.name,
        description: formData.description || '',
        ...(formData.selectedTemplateId && { templateId: formData.selectedTemplateId }),
        schedule: {
          startTime: formData.time,
          endTime: formData.time,
          daysOfWeek: formData.daysOfWeek || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          isRecurring: true,
        },
        settings: {
          allowSnooze: formData.allowPartialCompletion !== false,
          allowDismiss: formData.requireAllTasks !== false,
          reminderInterval: 5,
        },
      };

      let routineId;
      const tasks = formData.tasks || [];

      if (clientId) {
        if (editId) {
          await axiosClient.put(`/api/routines/user/${clientId}/${editId}`, routinePayload);
          routineId = editId;
          const currentTaskIds = tasks.filter((t) => t.id && isMongoObjectId(t.id)).map((t) => String(t.id));
          const originalTaskIds = (formData._originalTaskIds || []).filter(isMongoObjectId).map(String);
          const toDelete = originalTaskIds.filter((id) => !currentTaskIds.includes(id));
          for (const taskId of toDelete) {
            await axiosClient.delete(`/api/routines/user/${clientId}/task/${taskId}`);
          }
          for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const taskPayload = {
              routine: routineId,
              name: task.name,
              description: task.description || '',
              scheduledTime: formData.time || '09:00',
              estimatedDuration: task.estimatedTime || 15,
              completionCriteria: task.completionCriteria || 'manual',
              order: i,
            };
            if (task.id && isMongoObjectId(task.id)) {
              await axiosClient.put(`/api/routines/user/${clientId}/task/${task.id}`, taskPayload);
            } else {
              await axiosClient.post(`/api/routines/user/${clientId}/task`, taskPayload);
            }
          }
        } else {
          const tasksForApi = tasks.map((t, i) => ({
            name: t.name,
            description: t.description || '',
            estimatedDuration: t.estimatedTime || 15,
            completionCriteria: t.completionCriteria || 'manual',
            order: i,
          }));
          const rRes = await axiosClient.post(`/api/routines/user/${clientId}`, {
            ...routinePayload,
            tasks: tasksForApi,
          });
          routineId = rRes.data._id;
          await axiosClient.patch(`/api/routines/user/${clientId}/${routineId}/activate`).catch(() => {});
        }
      } else {
        if (editId) {
          await axiosClient.put(`/api/routines/${editId}`, routinePayload);
          routineId = editId;
        } else {
          const rRes = await axiosClient.post('/api/routines', routinePayload);
          routineId = rRes.data._id;
          await axiosClient.patch(`/api/routines/${routineId}/set-active`).catch(() => {});
        }
        for (const task of tasks) {
          const taskPayload = {
            routine: routineId,
            name: task.name,
            description: task.description || '',
            scheduledTime: formData.time || '09:00',
            type: 'daily',
            estimatedDuration: task.estimatedTime || 15,
            completionCriteria: task.completionCriteria || 'manual',
          };
          if (task.id && isMongoObjectId(task.id) && editId) {
            await axiosClient.put(`/api/tasks/${task.id}`, taskPayload);
          } else {
            await axiosClient.post('/api/tasks', taskPayload);
          }
        }
      }

      navigate(returnPath, {
        state: {
          message: `Routine "${formData.name}" ${isDraft ? 'saved as draft' : 'saved'} successfully!`,
          type: 'success',
        },
      });
    } catch (error) {
      console.error('Error saving routine:', error);
      setErrors({ general: error.response?.data?.error || 'Failed to save routine. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (Object.keys(formData).some(key => !['_originalTaskIds'].includes(key) && formData[key] !== '' && formData[key] !== false && !Array.isArray(formData[key]))) {
      if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
        navigate(returnPath);
      }
    } else {
      navigate(returnPath);
    }
  };

  const getCompletedSections = () => sectionKeys.filter(isSectionValid);

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
            onClick={() => navigate(returnPath)}
            className="hover:text-text-primary transition-colors duration-200"
          >
            {returnPath === '/admin-dashboard' ? 'Admin Dashboard' : clientId ? 'Therapist Dashboard' : 'Dashboard'}
          </button>
          <Icon name="ChevronRight" size={16} />
          {clientId && (
            <>
              <span className="text-text-primary">Client Routines</span>
              <Icon name="ChevronRight" size={16} />
            </>
          )}
          <span className="text-text-primary">
            {params.get('edit') ? 'Edit Routine' : 'Create New Routine'}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Indicator */}
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSections={getCompletedSections()}
              accessibilitySettings={accessibilitySettings || {}}
            />

            {/* Template Selector Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowTemplateSelector(true)}
                iconName="LayoutTemplate"
                iconPosition="left"
              >
                Choose from Template
              </Button>
            </div>

            {/* AI Routine Loaded Banner */}
            {aiRoutineLoaded && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Sparkles" size={20} className="text-primary" />
                  <p className="text-primary-700 font-medium">
                    AI-generated routine loaded! Review and customize the details below, then save.
                  </p>
                </div>
              </div>
            )}

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
                formData={formData || {}}
                onUpdate={(data) => handleSectionUpdate('basic', data)}
                isExpanded={expandedSections.basic}
                onToggle={() => handleSectionToggle('basic')}
                errors={errors || {}}
                accessibilitySettings={accessibilitySettings || {}}
              />

              <ScheduleSettings
                formData={formData || {}}
                onUpdate={(data) => handleSectionUpdate('schedule', data)}
                isExpanded={expandedSections.schedule}
                onToggle={() => handleSectionToggle('schedule')}
                errors={errors || {}}
                accessibilitySettings={accessibilitySettings || {}}
              />

              <TaskManager
                formData={formData || {}}
                onUpdate={(data) => handleSectionUpdate('tasks', data)}
                isExpanded={expandedSections.tasks}
                onToggle={() => handleSectionToggle('tasks')}
                errors={errors || {}}
                accessibilitySettings={accessibilitySettings || {}}
              />

              <ReminderSettings
                formData={formData || {}}
                onUpdate={(data) => handleSectionUpdate('reminders', data)}
                isExpanded={expandedSections.reminders}
                onToggle={() => handleSectionToggle('reminders')}
                errors={errors || {}}
                accessibilitySettings={accessibilitySettings || {}}
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
                formData={formData || {}}
                isVisible={showLivePreview}
                accessibilitySettings={accessibilitySettings || {}}
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