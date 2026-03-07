import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const COMPLETION_CRITERIA = {
  manual: { name: 'Manual', icon: 'CheckSquare' },
  timer: { name: 'Timer', icon: 'Timer' },
  photo: { name: 'Photo', icon: 'Camera' },
  location: { name: 'Location', icon: 'MapPin' },
};

const TodaysRoutines = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const rRes = await axiosClient.get('/api/routines');
      const list = Array.isArray(rRes.data) ? rRes.data : [];
      setRoutines(list);
      const active = list.find((r) => r.isActive) || (list.length ? list[0] : null);
      setActiveRoutine(active);

      // Fetch tasks for the displayed routine (active or first)
      // Use routine ID so we get tasks even when routine was force-completed (inactive)
      const display = active || (list.length ? list[0] : null);
      if (display?._id) {
        const tRes = await axiosClient.get(`/api/tasks?routine=${display._id}`).catch(() => ({ data: [] }));
        setTasks(Array.isArray(tRes.data) ? tRes.data : []);
      } else {
        setTasks([]);
      }
    } catch (e) {
      setRoutines([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every 60s so expired snoozes update
    return () => clearInterval(interval);
  }, []);

  const handleTaskComplete = async (taskId) => {
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/toggle-complete`);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: !t.completed } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleTaskSnooze = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task?.isSnoozed) return; // Already snoozed - don't snooze again
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/snooze`, { minutes: 5 });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, isSnoozed: true } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleTaskDismiss = async (taskId) => {
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/dismiss`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (task) => {
    if (task.completed) return 'text-success bg-success-50 border-success-200';
    if (task.isDismissed) return 'text-text-tertiary bg-surface-tertiary border-border-secondary';
    if (task.isSnoozed) return 'text-warning bg-warning-50 border-warning-200';
    return 'text-primary bg-primary-50 border-primary-200';
  };

  const displayRoutine = activeRoutine || routines[0];
  const routineTasks = tasks;
  const completedCount = routineTasks.filter((t) => t.completed).length;
  const progress = routineTasks.length ? Math.round((completedCount / routineTasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-border mb-6">
        <div className="flex items-center justify-center py-12">
          <span className="text-text-secondary">Loading routines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <Icon name="Calendar" size={24} className="mr-2 text-primary" />
          Today&apos;s Routines
        </h2>
        <Button
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          onClick={() => navigate('/routine-builder')}
          className="text-sm"
        >
          Add Routine
        </Button>
      </div>

      <div className="space-y-4">
        {displayRoutine && (
          <div className="bg-surface-secondary rounded-lg p-4 border border-border hover:border-primary-200 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-text-primary mr-3">
                    {displayRoutine.title || displayRoutine.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    progress === 100
                      ? 'text-success bg-success-50 border-success-200'
                      : 'text-primary bg-primary-50 border-primary-200'
                  }`}>
                    {progress === 100 ? (
                      <>
                        <Icon name="CheckCircle" size={12} className="inline mr-1" />
                        Completed
                      </>
                    ) : displayRoutine.isActive ? (
                      <>
                        <Icon name="Play" size={12} className="inline mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Icon name="Clock" size={12} className="inline mr-1" />
                        Scheduled
                      </>
                    )}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-2">
                  {displayRoutine.description || 'No description'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-text-tertiary">
                  <span className="flex items-center">
                    <Icon name="Clock" size={14} className="mr-1" />
                    {displayRoutine.schedule?.startTime || '--:--'}
                  </span>
                </div>
              </div>
            </div>

            {routineTasks.length > 0 && progress === 100 && (
              <div className="mb-3 p-3 rounded-lg bg-success-50 border border-success-200 flex items-center gap-3">
                <Icon name="CheckCircle" size={24} className="text-success shrink-0" />
                <div>
                  <p className="font-medium text-success">All tasks completed!</p>
                  <p className="text-sm text-text-secondary">Great job finishing this routine.</p>
                </div>
              </div>
            )}
            <div className="mb-3">
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-surface-tertiary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${displayRoutine.title || displayRoutine.name} progress: ${progress}%`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-secondary">Tasks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {routineTasks.map((task) => {
                  const criteria = COMPLETION_CRITERIA[task.completionCriteria] || COMPLETION_CRITERIA.manual;
                  return (
                  <div
                    key={task._id}
                    className={`flex flex-wrap items-center gap-2 p-2 rounded text-sm border ${getStatusColor(task)}`}
                    title={task.description || undefined}
                  >
                    <button
                      type="button"
                      onClick={() => !task.completed && !task.isDismissed && handleTaskComplete(task._id)}
                      className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={task.completed ? 'Completed' : 'Mark complete'}
                    >
                      <Icon
                        name={task.completed ? 'CheckCircle' : 'Circle'}
                        size={16}
                        className={task.completed ? 'text-success' : 'text-text-tertiary'}
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={task.completed ? 'line-through' : ''}>
                        {task.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-0.5 text-xs text-text-tertiary">
                          <Icon name={criteria.icon} size={10} />
                          {(criteria.name)}
                        </span>
                        {task.description && (
                          <span className="text-xs text-text-tertiary truncate max-w-[120px]" title={task.description}>
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {!task.completed && !task.isDismissed && (
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTaskSnooze(task._id)}
                          disabled={task.isSnoozed}
                          className={`p-1 rounded ${task.isSnoozed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/10'}`}
                          aria-label={task.isSnoozed ? 'Already snoozed' : 'Snooze'}
                        >
                          <Icon name="Clock" size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTaskDismiss(task._id)}
                          className="p-1 rounded hover:bg-black/10"
                          aria-label="Dismiss"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {routines.length > 1 && routines.filter((r) => !r.isActive).length > 0 && (
          <div className="text-sm text-text-secondary">
            Other routines: {routines.filter((r) => !r.isActive).map((r) => r.title || r.name).join(', ')}
          </div>
        )}
        {routines.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/routines')}
              className="text-sm text-primary hover:underline font-medium"
            >
              View all routines →
            </button>
          </div>
        )}
      </div>

      {!displayRoutine && routines.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={48} className="mx-auto text-text-tertiary mb-4" />
          <p className="text-text-secondary mb-4">No routines yet</p>
          <Button
            variant="primary"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate('/routine-builder')}
          >
            Create Your First Routine
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodaysRoutines;
