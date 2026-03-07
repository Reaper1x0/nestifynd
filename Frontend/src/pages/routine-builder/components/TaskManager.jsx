import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const TaskManager = ({ 
  formData, 
  onUpdate, 
  isExpanded, 
  onToggle,
  errors = {},
  accessibilitySettings = {}
}) => {
  const [localData, setLocalData] = useState({
    tasks: formData.tasks || [],
    allowPartialCompletion: formData.allowPartialCompletion || false,
    requireAllTasks: formData.requireAllTasks !== false
  });

  // Sync with parent formData when it changes (e.g., from AI routine or template)
  useEffect(() => {
    setLocalData({
      tasks: formData.tasks || [],
      allowPartialCompletion: formData.allowPartialCompletion || false,
      requireAllTasks: formData.requireAllTasks !== false
    });
  }, [formData.tasks, formData.allowPartialCompletion, formData.requireAllTasks]);

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    estimatedTime: 5,
    isRequired: true,
    hasVoicePrompt: false,
    voicePromptText: '',
    completionCriteria: 'manual'
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);

  const completionCriteriaOptions = [
    { id: 'manual', name: 'Manual Check-off', icon: 'CheckSquare' },
    { id: 'timer', name: 'Timer-based', icon: 'Timer' },
    { id: 'photo', name: 'Photo Verification', icon: 'Camera' },
    { id: 'location', name: 'Location-based', icon: 'MapPin' }
  ];

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;

    const task = {
      id: Date.now().toString(),
      ...newTask,
      order: localData.tasks.length
    };

    const updatedData = {
      ...localData,
      tasks: [...localData.tasks, task]
    };

    setLocalData(updatedData);
    onUpdate(updatedData);
    setNewTask({
      name: '',
      description: '',
      estimatedTime: 5,
      isRequired: true,
      hasVoicePrompt: false,
      voicePromptText: '',
      completionCriteria: 'manual'
    });
    setShowAddTask(false);
  };

  const handleEditTask = (taskId) => {
    const task = localData.tasks.find(t => t.id === taskId);
    if (task) {
      setNewTask({ ...task });
      setEditingTaskId(taskId);
      setShowAddTask(true);
    }
  };

  const handleUpdateTask = () => {
    if (!newTask.name.trim()) return;

    const updatedTasks = localData.tasks.map(task =>
      task.id === editingTaskId ? { ...newTask, id: editingTaskId } : task
    );

    const updatedData = {
      ...localData,
      tasks: updatedTasks
    };

    setLocalData(updatedData);
    onUpdate(updatedData);
    setEditingTaskId(null);
    setNewTask({
      name: '',
      description: '',
      estimatedTime: 5,
      isRequired: true,
      hasVoicePrompt: false,
      voicePromptText: '',
      completionCriteria: 'manual'
    });
    setShowAddTask(false);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = localData.tasks.filter(task => task.id !== taskId);
    const updatedData = {
      ...localData,
      tasks: updatedTasks
    };

    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleReorderTask = (taskId, direction) => {
    const currentIndex = localData.tasks.findIndex(task => task.id === taskId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= localData.tasks.length) return;

    const updatedTasks = [...localData.tasks];
    [updatedTasks[currentIndex], updatedTasks[newIndex]] = [updatedTasks[newIndex], updatedTasks[currentIndex]];

    const updatedData = {
      ...localData,
      tasks: updatedTasks.map((task, index) => ({ ...task, order: index }))
    };

    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleSettingChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-6 text-left
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
          ${isExpanded ? 'border-b border-border' : ''}
          ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
        `}
        aria-expanded={isExpanded}
        aria-controls="task-manager-content"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
            <Icon name="CheckSquare" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Task Management
            </h3>
            <p className="text-sm text-text-secondary">
              {localData.tasks.length} task{localData.tasks.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {errors.tasks && (
            <Icon name="AlertCircle" size={20} className="text-error" />
          )}
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={20} 
            className="text-text-secondary"
          />
        </div>
      </button>

      {isExpanded && (
        <div 
          id="task-manager-content"
          className={`
            p-6 space-y-6
            ${!accessibilitySettings.reducedMotion ? 'animate-fade-in' : ''}
          `}
        >
          {/* Task List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-text-primary">
                Tasks ({localData.tasks.length})
              </h4>
              <Button
                variant="primary"
                onClick={() => setShowAddTask(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Add Task
              </Button>
            </div>

            {localData.tasks.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Icon name="CheckSquare" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks added yet</p>
                <p className="text-sm">Add tasks to break down your routine into manageable steps</p>
              </div>
            ) : (
              <div className="space-y-3">
                {localData.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-4 bg-surface-secondary rounded-lg border border-border"
                  >
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleReorderTask(task.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move task up"
                      >
                        <Icon name="ChevronUp" size={16} />
                      </button>
                      <button
                        onClick={() => handleReorderTask(task.id, 'down')}
                        disabled={index === localData.tasks.length - 1}
                        className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move task down"
                      >
                        <Icon name="ChevronDown" size={16} />
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-text-primary">{task.name}</h5>
                        {task.isRequired && (
                          <span className="px-2 py-1 bg-error-100 text-error text-xs rounded">
                            Required
                          </span>
                        )}
                        {task.hasVoicePrompt && (
                          <Icon name="Volume2" size={16} className="text-primary" />
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-text-secondary mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-text-secondary">
                        <span className="flex items-center space-x-1">
                          <Icon name="Clock" size={14} />
                          <span>{task.estimatedTime} min</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Icon name={completionCriteriaOptions.find(c => c.id === task.completionCriteria)?.icon || 'CheckSquare'} size={14} />
                          <span>{completionCriteriaOptions.find(c => c.id === task.completionCriteria)?.name}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleEditTask(task.id)}
                        iconName="Edit"
                        aria-label="Edit task"
                      />
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteTask(task.id)}
                        iconName="Trash2"
                        className="text-error hover:text-error"
                        aria-label="Delete task"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Task Form */}
          {showAddTask && (
            <div className="border-t border-border pt-6">
              <h4 className="text-md font-medium text-text-primary mb-4">
                {editingTaskId ? 'Edit Task' : 'Add New Task'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="task-name" className="block text-sm font-medium text-text-primary mb-2">
                    Task Name <span className="text-error">*</span>
                  </label>
                  <Input
                    id="task-name"
                    type="text"
                    placeholder="Enter task name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="task-description" className="block text-sm font-medium text-text-primary mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="task-description"
                    placeholder="Describe what needs to be done..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary placeholder-text-tertiary"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="estimated-time" className="block text-sm font-medium text-text-primary mb-2">
                      Estimated Time (minutes)
                    </label>
                    <Input
                      id="estimated-time"
                      type="number"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={120}
                    />
                  </div>

                  <div>
                    <label htmlFor="completion-criteria" className="block text-sm font-medium text-text-primary mb-2">
                      Completion Method
                    </label>
                    <select
                      id="completion-criteria"
                      value={newTask.completionCriteria}
                      onChange={(e) => setNewTask({ ...newTask, completionCriteria: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary"
                    >
                      {completionCriteriaOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="task-required"
                      type="checkbox"
                      checked={newTask.isRequired}
                      onChange={(e) => setNewTask({ ...newTask, isRequired: e.target.checked })}
                    />
                    <label htmlFor="task-required" className="text-sm font-medium text-text-primary">
                      Required task
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      id="voice-prompt"
                      type="checkbox"
                      checked={newTask.hasVoicePrompt}
                      onChange={(e) => setNewTask({ ...newTask, hasVoicePrompt: e.target.checked })}
                    />
                    <label htmlFor="voice-prompt" className="text-sm font-medium text-text-primary">
                      Voice prompt
                    </label>
                  </div>
                </div>

                {newTask.hasVoicePrompt && (
                  <div>
                    <label htmlFor="voice-prompt-text" className="block text-sm font-medium text-text-primary mb-2">
                      Voice Prompt Text
                    </label>
                    <Input
                      id="voice-prompt-text"
                      type="text"
                      placeholder="Enter text to be spoken as a reminder"
                      value={newTask.voicePromptText}
                      onChange={(e) => setNewTask({ ...newTask, voicePromptText: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={editingTaskId ? handleUpdateTask : handleAddTask}
                    disabled={!newTask.name.trim()}
                  >
                    {editingTaskId ? 'Update Task' : 'Add Task'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddTask(false);
                      setEditingTaskId(null);
                      setNewTask({
                        name: '',
                        description: '',
                        estimatedTime: 5,
                        isRequired: true,
                        hasVoicePrompt: false,
                        voicePromptText: '',
                        completionCriteria: 'manual'
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Task Completion Settings */}
          <div className="border-t border-border pt-6">
            <h4 className="text-md font-medium text-text-primary mb-4">
              Completion Settings
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Input
                  id="allow-partial"
                  type="checkbox"
                  checked={localData.allowPartialCompletion}
                  onChange={(e) => handleSettingChange('allowPartialCompletion', e.target.checked)}
                />
                <label htmlFor="allow-partial" className="text-sm font-medium text-text-primary">
                  Allow partial completion of routine
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Input
                  id="require-all"
                  type="checkbox"
                  checked={localData.requireAllTasks}
                  onChange={(e) => handleSettingChange('requireAllTasks', e.target.checked)}
                />
                <label htmlFor="require-all" className="text-sm font-medium text-text-primary">
                  Require all required tasks to be completed
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;