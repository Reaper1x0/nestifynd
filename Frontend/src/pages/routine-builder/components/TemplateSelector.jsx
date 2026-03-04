import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import axiosClient from '../../../api/axiosClient';

const TemplateSelector = ({ 
  onTemplateSelect, 
  isVisible, 
  onClose,
  accessibilitySettings = {}
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiTemplates, setApiTemplates] = useState([]);
  useEffect(() => {
    if (!isVisible) return;
    axiosClient.get('/api/templates/templates').then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      setApiTemplates(list.map((t) => {
        const cat = (t.category || '').toLowerCase();
        return {
          _id: t._id,
          id: t._id,
          name: t.name,
          description: t.description || '',
          category: cat === 'other' ? 'personal' : cat,
          duration: (t.tasks || []).reduce((s, k) => s + (k.durationMinutes || 0), 0) || 30,
          tasks: (t.tasks || []).length,
          difficulty: 'Easy',
          icon: 'Layout',
          color: '#4F46E5',
          tags: [],
          tasks_preview: (t.tasks || []).map((k) => k.name || k)
        };
      }));
    }).catch(() => setApiTemplates([]));
  }, [isVisible]);

  const templateCategories = [
    { id: 'all', name: 'All Templates', icon: 'Grid3x3' },
    { id: 'morning', name: 'Morning', icon: 'Sunrise' },
    { id: 'evening', name: 'Evening', icon: 'Sunset' },
    { id: 'work', name: 'Work/Study', icon: 'Briefcase' },
    { id: 'health', name: 'Health', icon: 'Heart' },
    { id: 'social', name: 'Social', icon: 'Users' },
    { id: 'personal', name: 'Personal Care', icon: 'User' }
  ];

  const routineTemplates = [
    {
      id: 'morning-basic',
      name: 'Basic Morning Routine',
      category: 'morning',
      description: 'A simple morning routine to start your day right',
      duration: 45,
      tasks: 6,
      difficulty: 'Easy',
      icon: 'Sun',
      color: '#F59E0B',
      tags: ['beginner', 'daily', 'wellness'],
      tasks_preview: ['Wake up and stretch', 'Brush teeth', 'Shower', 'Get dressed', 'Eat breakfast', 'Review daily goals']
    },
    {
      id: 'evening-wind-down',
      name: 'Evening Wind Down',
      category: 'evening',
      description: 'Relaxing routine to prepare for restful sleep',
      duration: 30,
      tasks: 5,
      difficulty: 'Easy',
      icon: 'Moon',
      color: '#8B5CF6',
      tags: ['relaxation', 'sleep', 'mindfulness'],
      tasks_preview: ['Dim lights', 'Light reading', 'Meditation', 'Prepare clothes for tomorrow', 'Set phone to silent']
    },
    {
      id: 'work-focus',
      name: 'Work Focus Session',
      category: 'work',
      description: 'Structured routine for productive work sessions',
      duration: 90,
      tasks: 8,
      difficulty: 'Medium',
      icon: 'Briefcase',
      color: '#3B82F6',
      tags: ['productivity', 'focus', 'work'],
      tasks_preview: ['Clear workspace', 'Review priorities', 'Set timer', 'Deep work block', 'Short break', 'Email check', 'Progress review', 'Plan next session']
    },
    {
      id: 'exercise-basic',
      name: 'Basic Exercise Routine',
      category: 'health',
      description: 'Simple daily exercise routine for beginners',
      duration: 25,
      tasks: 4,
      difficulty: 'Easy',
      icon: 'Dumbbell',
      color: '#EF4444',
      tags: ['fitness', 'health', 'beginner'],
      tasks_preview: ['Warm-up stretches', '10-minute cardio', 'Strength exercises', 'Cool-down stretches']
    },
    {
      id: 'meal-prep',
      name: 'Weekly Meal Prep',
      category: 'health',
      description: 'Organize and prepare meals for the week',
      duration: 120,
      tasks: 7,
      difficulty: 'Medium',
      icon: 'Utensils',
      color: '#10B981',
      tags: ['nutrition', 'planning', 'weekly'],
      tasks_preview: ['Plan weekly menu', 'Create shopping list', 'Grocery shopping', 'Prep vegetables', 'Cook proteins', 'Portion meals', 'Store properly']
    },
    {
      id: 'social-check-in',
      name: 'Social Connection',
      category: 'social',
      description: 'Stay connected with friends and family',
      duration: 20,
      tasks: 3,
      difficulty: 'Easy',
      icon: 'MessageCircle',
      color: '#06B6D4',
      tags: ['social', 'communication', 'relationships'],
      tasks_preview: ['Check messages', 'Call a friend or family member', 'Plan social activity']
    },
    {
      id: 'self-care-sunday',
      name: 'Self-Care Sunday',
      category: 'personal',
      description: 'Weekly self-care routine for mental wellness',
      duration: 60,
      tasks: 5,
      difficulty: 'Easy',
      icon: 'Heart',
      color: '#F97316',
      tags: ['self-care', 'wellness', 'weekly'],
      tasks_preview: ['Take relaxing bath', 'Face mask', 'Journal writing', 'Gentle yoga', 'Plan upcoming week']
    },
    {
      id: 'study-session',
      name: 'Focused Study Session',
      category: 'work',
      description: 'Structured approach to effective studying',
      duration: 75,
      tasks: 6,
      difficulty: 'Medium',
      icon: 'Book',
      color: '#7C3AED',
      tags: ['study', 'learning', 'focus'],
      tasks_preview: ['Organize study materials', 'Review previous notes', 'Active study (25 min)', 'Break (5 min)', 'Practice problems', 'Summarize key points']
    }
  ];

  const allTemplates = apiTemplates.length > 0 ? apiTemplates : routineTemplates;
  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const tags = template.tags || [];
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (template.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template) => {
    onTemplateSelect(template);
    onClose();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-success bg-success-50';
      case 'Medium': return 'text-warning bg-warning-50';
      case 'Hard': return 'text-error bg-error-50';
      default: return 'text-text-secondary bg-surface-secondary';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-200 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className={`
          bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col
          ${!accessibilitySettings.reducedMotion ? 'animate-scale-in' : ''}
        `}
        role="dialog"
        aria-labelledby="template-selector-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between p-6 border-b border-border">
          <div>
            <h2 id="template-selector-title" className="text-xl font-semibold text-text-primary">
              Choose a Template
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Start with a pre-built routine and customize it to your needs
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            iconName="X"
            aria-label="Close template selector"
          />
        </div>

        {/* Search and Filters */}
        <div className="shrink-0 p-6 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                aria-label="Search routine templates"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${selectedCategory === category.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-surface hover:border-primary-200 text-text-secondary hover:text-text-primary'
                    }
                    ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                  `}
                  aria-pressed={selectedCategory === category.id}
                >
                  <Icon name={category.icon} size={16} />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid - flex-1 min-h-0 so it scrolls and footer stays visible */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto mb-4 text-text-tertiary" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No templates found</h3>
              <p className="text-text-secondary">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-surface-secondary rounded-lg border border-border p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: template.color + '20' }}
                    >
                      <Icon 
                        name={template.icon} 
                        size={20} 
                        color={template.color}
                      />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <h3 className="font-semibold text-text-primary mb-2">{template.name}</h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{template.description}</p>

                  <div className="flex items-center space-x-4 text-xs text-text-secondary mb-3">
                    <span className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{template.duration} min</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="CheckSquare" size={14} />
                      <span>{template.tasks} tasks</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-50 text-primary text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-text-primary mb-2">Sample tasks:</p>
                    <ul className="text-xs text-text-secondary space-y-1">
                      {template.tasks_preview.slice(0, 3).map((task, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Icon name="Check" size={12} className="text-success" />
                          <span>{task}</span>
                        </li>
                      ))}
                      {template.tasks_preview.length > 3 && (
                        <li className="text-text-tertiary">
                          +{template.tasks_preview.length - 3} more tasks...
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - always visible at bottom */}
        <div className="shrink-0 p-4 sm:p-6 border-t border-border bg-surface-secondary">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Start from Scratch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;