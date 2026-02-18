import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TodaysRoutines = () => {
  const [routines, setRoutines] = useState([
    {
      id: 1,
      name: "Morning Routine",
      description: "Start your day with mindfulness and preparation",
      estimatedTime: "30 min",
      currentStreak: 5,
      progress: 75,
      status: "in-progress",
      tasks: [
        { id: 1, name: "Brush teeth", completed: true },
        { id: 2, name: "Take medication", completed: true },
        { id: 3, name: "Eat breakfast", completed: true },
        { id: 4, name: "Review daily schedule", completed: false }
      ]
    },
    {
      id: 2,
      name: "Work Focus Session",
      description: "Deep work block with breaks",
      estimatedTime: "90 min",
      currentStreak: 3,
      progress: 0,
      status: "pending",
      tasks: [
        { id: 5, name: "Clear workspace", completed: false },
        { id: 6, name: "Review priorities", completed: false },
        { id: 7, name: "Focus work (45 min)", completed: false },
        { id: 8, name: "Take break", completed: false }
      ]
    },
    {
      id: 3,
      name: "Evening Wind Down",
      description: "Prepare for restful sleep",
      estimatedTime: "45 min",
      currentStreak: 7,
      progress: 0,
      status: "scheduled",
      tasks: [
        { id: 9, name: "Dim lights", completed: false },
        { id: 10, name: "No screens", completed: false },
        { id: 11, name: "Read or journal", completed: false },
        { id: 12, name: "Prepare for tomorrow", completed: false }
      ]
    }
  ]);

  const handleRoutineAction = (routineId, action) => {
    setRoutines(prev => prev.map(routine => {
      if (routine.id === routineId) {
        switch (action) {
          case 'complete':
            return { ...routine, status: 'completed', progress: 100 };
          case 'snooze':
            return { ...routine, status: 'snoozed' };
          case 'dismiss':
            return { ...routine, status: 'dismissed' };
          default:
            return routine;
        }
      }
      return routine;
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success-50 border-success-200';
      case 'in-progress':
        return 'text-primary bg-primary-50 border-primary-200';
      case 'snoozed':
        return 'text-warning bg-warning-50 border-warning-200';
      case 'dismissed':
        return 'text-text-tertiary bg-surface-tertiary border-border-secondary';
      default:
        return 'text-text-secondary bg-surface-secondary border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'in-progress':
        return 'Play';
      case 'snoozed':
        return 'Clock';
      case 'dismissed':
        return 'X';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <Icon name="Calendar" size={24} className="mr-2 text-primary" />
          Today's Routines
        </h2>
        <Button
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          onClick={() => {}}
          className="text-sm"
        >
          Add Routine
        </Button>
      </div>

      <div className="space-y-4">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className="bg-surface-secondary rounded-lg p-4 border border-border hover:border-primary-200 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-text-primary mr-3">
                    {routine.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(routine.status)}`}>
                    <Icon name={getStatusIcon(routine.status)} size={12} className="inline mr-1" />
                    {routine.status.charAt(0).toUpperCase() + routine.status.slice(1)}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-2">
                  {routine.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-text-tertiary">
                  <span className="flex items-center">
                    <Icon name="Clock" size={14} className="mr-1" />
                    {routine.estimatedTime}
                  </span>
                  <span className="flex items-center">
                    <Icon name="Zap" size={14} className="mr-1" />
                    {routine.currentStreak} day streak
                  </span>
                </div>
              </div>

              {routine.status !== 'completed' && routine.status !== 'dismissed' && (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="success"
                    iconName="Check"
                    iconPosition="left"
                    onClick={() => handleRoutineAction(routine.id, 'complete')}
                    className="min-w-[44px] min-h-[44px]"
                  >
                    Complete
                  </Button>
                  <Button
                    variant="warning"
                    iconName="Clock"
                    iconPosition="left"
                    onClick={() => handleRoutineAction(routine.id, 'snooze')}
                    className="min-w-[44px] min-h-[44px]"
                  >
                    Snooze
                  </Button>
                  <Button
                    variant="ghost"
                    iconName="X"
                    iconPosition="left"
                    onClick={() => handleRoutineAction(routine.id, 'dismiss')}
                    className="min-w-[44px] min-h-[44px]"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Progress</span>
                <span>{routine.progress}%</span>
              </div>
              <div className="w-full bg-surface-tertiary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${routine.progress}%` }}
                  role="progressbar"
                  aria-valuenow={routine.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${routine.name} progress: ${routine.progress}%`}
                />
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-secondary">Tasks:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {routine.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center space-x-2 p-2 rounded text-sm ${
                      task.completed
                        ? 'bg-success-50 text-success-700 border border-success-200' :'bg-surface border border-border'
                    }`}
                  >
                    <Icon
                      name={task.completed ? 'CheckCircle' : 'Circle'}
                      size={16}
                      className={task.completed ? 'text-success' : 'text-text-tertiary'}
                    />
                    <span className={task.completed ? 'line-through' : ''}>
                      {task.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {routines.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={48} className="mx-auto text-text-tertiary mb-4" />
          <p className="text-text-secondary mb-4">No routines scheduled for today</p>
          <Button variant="primary" iconName="Plus" iconPosition="left">
            Create Your First Routine
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodaysRoutines;