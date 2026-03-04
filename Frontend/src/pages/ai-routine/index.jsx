import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axiosClient from '../../api/axiosClient';

const ACTIVITY_SUGGESTIONS = {
  Morning: [
    { id: 'wake-up', name: 'Wake up gently', icon: 'Sun' },
    { id: 'stretch', name: 'Morning stretch', icon: 'Activity' },
    { id: 'hydrate', name: 'Drink water', icon: 'Droplet' },
    { id: 'brush-teeth', name: 'Brush teeth', icon: 'Smile' },
    { id: 'shower', name: 'Take a shower', icon: 'Droplets' },
    { id: 'skincare', name: 'Skincare routine', icon: 'Sparkles' },
    { id: 'get-dressed', name: 'Get dressed', icon: 'User' },
    { id: 'breakfast', name: 'Eat breakfast', icon: 'Coffee' },
    { id: 'medication', name: 'Take medication', icon: 'Heart' },
    { id: 'journal', name: 'Morning journal', icon: 'BookOpen' },
    { id: 'meditate', name: 'Meditate', icon: 'Brain' },
    { id: 'exercise', name: 'Exercise', icon: 'Dumbbell' },
  ],
  Afternoon: [
    { id: 'lunch', name: 'Eat lunch', icon: 'Utensils' },
    { id: 'walk', name: 'Take a walk', icon: 'MapPin' },
    { id: 'hydrate', name: 'Drink water', icon: 'Droplet' },
    { id: 'focus-work', name: 'Focus work session', icon: 'Target' },
    { id: 'break', name: 'Take a break', icon: 'Coffee' },
    { id: 'snack', name: 'Healthy snack', icon: 'Apple' },
    { id: 'stretch', name: 'Stretch break', icon: 'Activity' },
    { id: 'organize', name: 'Organize workspace', icon: 'Layout' },
    { id: 'emails', name: 'Check emails', icon: 'Mail' },
    { id: 'nap', name: 'Power nap', icon: 'Moon' },
  ],
  Evening: [
    { id: 'dinner', name: 'Eat dinner', icon: 'Utensils' },
    { id: 'cleanup', name: 'Clean up kitchen', icon: 'Trash2' },
    { id: 'relax', name: 'Relaxation time', icon: 'Sofa' },
    { id: 'hobby', name: 'Enjoy a hobby', icon: 'Palette' },
    { id: 'family', name: 'Family time', icon: 'Users' },
    { id: 'read', name: 'Read a book', icon: 'BookOpen' },
    { id: 'screen-off', name: 'Screen-free time', icon: 'Monitor' },
    { id: 'prepare-tomorrow', name: 'Prepare for tomorrow', icon: 'Calendar' },
    { id: 'skincare-pm', name: 'Evening skincare', icon: 'Sparkles' },
    { id: 'gratitude', name: 'Gratitude practice', icon: 'Heart' },
  ],
  Night: [
    { id: 'brush-teeth-pm', name: 'Brush teeth', icon: 'Smile' },
    { id: 'wash-face', name: 'Wash face', icon: 'Droplets' },
    { id: 'pajamas', name: 'Change into pajamas', icon: 'User' },
    { id: 'dim-lights', name: 'Dim the lights', icon: 'Sun' },
    { id: 'meditate-pm', name: 'Evening meditation', icon: 'Brain' },
    { id: 'journal-pm', name: 'Night journal', icon: 'BookOpen' },
    { id: 'breathing', name: 'Deep breathing', icon: 'Wind' },
    { id: 'music', name: 'Calming music', icon: 'Music' },
    { id: 'alarm', name: 'Set alarm', icon: 'Clock' },
    { id: 'sleep', name: 'Go to sleep', icon: 'Moon' },
  ],
  Flexible: [
    { id: 'hydrate', name: 'Drink water', icon: 'Droplet' },
    { id: 'stretch', name: 'Stretch', icon: 'Activity' },
    { id: 'walk', name: 'Take a walk', icon: 'MapPin' },
    { id: 'meditate', name: 'Meditate', icon: 'Brain' },
    { id: 'read', name: 'Read', icon: 'BookOpen' },
    { id: 'exercise', name: 'Exercise', icon: 'Dumbbell' },
    { id: 'journal', name: 'Journal', icon: 'BookOpen' },
    { id: 'organize', name: 'Organize', icon: 'Layout' },
    { id: 'break', name: 'Take a break', icon: 'Coffee' },
    { id: 'hobby', name: 'Enjoy a hobby', icon: 'Palette' },
  ]
};

const STEPS = [
  { id: 'timeOfDay', title: 'When?', question: 'What time of day works best for this routine?', type: 'select', options: ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'] },
  { id: 'duration', title: 'How long?', question: 'Roughly how long do you want the routine to take?', type: 'select', options: ['5–15 min', '15–30 min', '30–60 min', '1–2 hours', 'Flexible'] },
  { id: 'activities', title: 'Activities', question: 'Select activities to include (or add your own)', type: 'activities' },
  { id: 'goals', title: 'Goal', question: "What's the main goal of this routine?", type: 'textarea', placeholder: 'e.g. Start the day calmly and get ready without rush' }
];

const AIRoutinePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ timeOfDay: '', duration: '', activities: '', goals: '' });
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [customActivity, setCustomActivity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStepConfig = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (currentStepConfig.id === 'activities') {
      const activitiesString = selectedActivities.join(', ');
      setAnswers((a) => ({ ...a, activities: activitiesString }));
    }
    if (isLastStep) {
      handleGenerate();
      return;
    }
    setStep((s) => s + 1);
    setError('');
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
    setError('');
  };

  const handleGenerate = async () => {
    const activitiesString = selectedActivities.join(', ');
    const payload = {
      ...answers,
      activities: activitiesString || answers.activities
    };
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.post('/api/ai/generate-routine-from-qa', { answers: payload });
      console.log('AI generated routine:', data);
      
      if (!data || !data.name) {
        setError('AI returned an invalid response. Please try again.');
        return;
      }
      
      navigate('/routine-builder', { 
        state: { suggestedRoutine: data },
        replace: false 
      });
    } catch (e) {
      console.error('AI routine generation error:', e);
      const errorMsg = e.response?.data?.message || e.message || 'Failed to generate routine.';
      if (e.response?.status === 503) {
        setError('AI service is not configured. Please ask the administrator to set up the OpenAI API key in Admin Dashboard → AI settings.');
      } else {
        setError(errorMsg + ' Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (value) => {
    setAnswers((a) => ({ ...a, [currentStepConfig.id]: value }));
  };

  const toggleActivity = (activityName) => {
    setSelectedActivities((prev) => 
      prev.includes(activityName)
        ? prev.filter((a) => a !== activityName)
        : [...prev, activityName]
    );
  };

  const addCustomActivity = () => {
    if (customActivity.trim() && !selectedActivities.includes(customActivity.trim())) {
      setSelectedActivities((prev) => [...prev, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  const removeActivity = (activityName) => {
    setSelectedActivities((prev) => prev.filter((a) => a !== activityName));
  };

  const getSuggestedActivities = () => {
    const timeOfDay = answers.timeOfDay || 'Flexible';
    return ACTIVITY_SUGGESTIONS[timeOfDay] || ACTIVITY_SUGGESTIONS.Flexible;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">AI Routine Generator</h1>
              <p className="text-sm text-text-secondary">Answer a few questions and we'll suggest a routine for you.</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-text-tertiary mb-2">
              <span>Step {step + 1} of {STEPS.length}</span>
            </div>
            <div className="w-full bg-surface-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-text-primary">{currentStepConfig.question}</h2>
            
            {currentStepConfig.type === 'select' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStepConfig.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateAnswer(opt)}
                    className={`p-3 rounded-lg border text-left font-medium transition-colors ${
                      answers[currentStepConfig.id] === opt
                        ? 'border-primary bg-primary-50 text-primary-700'
                        : 'border-border bg-surface hover:border-primary-200 text-text-primary'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentStepConfig.type === 'activities' && (
              <div className="space-y-4">
                {/* Selected activities */}
                {selectedActivities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-2">Selected activities ({selectedActivities.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivities.map((activity) => (
                        <span
                          key={activity}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {activity}
                          <button
                            type="button"
                            onClick={() => removeActivity(activity)}
                            className="ml-1 hover:text-primary-900"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested activities based on time of day */}
                <div>
                  <p className="text-sm text-text-secondary mb-2">
                    Suggested {answers.timeOfDay || 'Flexible'} activities:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getSuggestedActivities().map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => toggleActivity(activity.name)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                          selectedActivities.includes(activity.name)
                            ? 'border-primary bg-primary-50 text-primary-700'
                            : 'border-border bg-surface hover:border-primary-200 text-text-primary'
                        }`}
                      >
                        <Icon 
                          name={activity.icon} 
                          size={18} 
                          className={selectedActivities.includes(activity.name) ? 'text-primary' : 'text-text-secondary'} 
                        />
                        <span className="truncate">{activity.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom activity input */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-text-secondary mb-2">Add a custom activity:</p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g., Practice piano"
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomActivity())}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={addCustomActivity}
                      disabled={!customActivity.trim()}
                      iconName="Plus"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStepConfig.type === 'textarea' && (
              <textarea
                placeholder={currentStepConfig.placeholder}
                value={answers[currentStepConfig.id]}
                onChange={(e) => updateAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary min-h-[100px] resize-y"
                rows={3}
              />
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-50 text-error-700 text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack} iconName="ArrowLeft" iconPosition="left">
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={
                loading || 
                (currentStepConfig.type === 'select' && !answers[currentStepConfig.id]) ||
                (currentStepConfig.type === 'activities' && selectedActivities.length === 0)
              }
              iconName={isLastStep ? 'Sparkles' : 'ArrowRight'}
              iconPosition="right"
            >
              {loading ? 'Generating…' : isLastStep ? 'Generate routine' : 'Next'}
            </Button>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-text-tertiary">
          You'll be taken to the routine builder to edit and save your AI-suggested routine.
        </p>
      </main>
    </div>
  );
};

export default AIRoutinePage;
