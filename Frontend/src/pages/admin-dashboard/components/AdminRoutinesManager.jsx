import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const AdminRoutinesManager = ({ userId, userName, onNavigateToBuilder, onUpdate, accessibilitySettings }) => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [taskActionLoading, setTaskActionLoading] = useState(null);

  const handleTaskToggleComplete = async (taskId) => {
    setTaskActionLoading(taskId);
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/toggle-complete`);
      await loadRoutines();
      onUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setTaskActionLoading(null);
    }
  };

  const handleTaskSnooze = async (taskId) => {
    setTaskActionLoading(taskId);
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/snooze`, { minutes: 5 });
      await loadRoutines();
      onUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setTaskActionLoading(null);
    }
  };

  const handleTaskDismiss = async (taskId) => {
    setTaskActionLoading(taskId);
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/dismiss`);
      await loadRoutines();
      onUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setTaskActionLoading(null);
    }
  };

  const loadRoutines = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/api/admin/users/${userId}/routines`);
      setRoutines(Array.isArray(data) ? data : []);
    } catch {
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [userId]);

  const handleSetActive = async (routineId) => {
    setActionLoading(routineId);
    try {
      await axiosClient.put('/api/admin/set-active-routine', { userId, routineId });
      setRoutines((prev) =>
        prev.map((r) => ({ ...r, isActive: r._id === routineId }))
      );
      onUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceComplete = async (routineId) => {
    if (!window.confirm('Force complete this routine? All tasks will be marked completed.')) return;
    setActionLoading(routineId);
    try {
      await axiosClient.put('/api/admin/force-complete-routine', { routineId });
      setRoutines((prev) =>
        prev.map((r) => (r._id === routineId ? { ...r, isActive: false } : r))
      );
      onUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  if (!userId) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="User" size={40} className="mx-auto mb-3 text-text-tertiary" />
        <p className="text-text-secondary">Select a user to manage their routines.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
        <p className="text-text-secondary">Loading routines...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">User Routines</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Routines and tasks for {userName || 'user'}
          </p>
        </div>
        <Button
          variant="primary"
          iconName="Plus"
          iconPosition="left"
          onClick={() => onNavigateToBuilder?.({ clientId: userId, clientName: userName })}
        >
          Create Routine
        </Button>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Icon name="Calendar" size={48} className="mx-auto mb-3 text-text-tertiary" />
          <p className="text-text-secondary mb-4">No routines for this user.</p>
          <Button
            variant="primary"
            iconName="Plus"
            iconPosition="left"
            onClick={() => onNavigateToBuilder?.({ clientId: userId })}
          >
            Create First Routine
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine) => {
            const tasks = routine.tasks || [];
            const completedCount = tasks.filter((t) => t.completed).length;
            const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
            return (
              <div
                key={routine._id}
                className="bg-surface-secondary rounded-xl p-4 border border-border hover:border-primary-200 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-text-primary pr-2">
                    {routine.title || routine.name || 'Untitled'}
                  </h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      routine.isActive ? 'text-primary bg-primary-50' : 'text-text-secondary bg-surface'
                    }`}
                  >
                    {routine.isActive ? 'Active' : 'Scheduled'}
                  </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2 mb-2 flex-1">
                  {routine.description || 'No description'}
                </p>
                <div className="text-sm text-text-tertiary mb-2">
                  <Icon name="Clock" size={14} className="inline mr-1" />
                  {routine.schedule?.startTime || '--:--'}
                  {routine.schedule?.daysOfWeek?.length > 0 && (
                    <span className="ml-2">· {routine.schedule.daysOfWeek.length} days</span>
                  )}
                  <span className="ml-2">· {tasks.length} tasks</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-text-secondary mb-0.5">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-surface-tertiary rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToBuilder?.({ clientId: userId, routineId: routine._id, mode: 'edit' })}
                    iconName="Edit"
                    iconPosition="left"
                  >
                    Edit
                  </Button>
                  {!routine.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetActive(routine._id)}
                      disabled={actionLoading === routine._id}
                      iconName="Play"
                      iconPosition="left"
                    >
                      Set active
                    </Button>
                  )}
                  {routine.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleForceComplete(routine._id)}
                      disabled={actionLoading === routine._id}
                      iconName="CheckCircle"
                      iconPosition="left"
                      className="text-success hover:text-success hover:bg-success-50"
                    >
                      Force Complete
                    </Button>
                  )}
                </div>
                {tasks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-text-secondary font-medium mb-1">Tasks</p>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {tasks.map((t) => {
                        const loading = taskActionLoading === t._id;
                        const isSnoozed = t.isSnoozed && t.snoozedUntil && new Date(t.snoozedUntil) > new Date();
                        const settings = t.settings || {};
                        const allowSnooze = settings.allowSnooze !== false;
                        const allowDismiss = settings.allowDismiss !== false;
                        return (
                          <div
                            key={t._id}
                            className={`text-xs flex flex-wrap items-center gap-2 py-1 ${
                              t.completed ? 'text-success' : t.isDismissed ? 'text-text-tertiary' : 'text-text-secondary'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleTaskToggleComplete(t._id)}
                              disabled={loading || !routine.isActive}
                              className="shrink-0 p-0.5 rounded hover:bg-surface-tertiary disabled:opacity-50"
                              aria-label={t.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              <Icon name={t.completed ? 'CheckCircle' : 'Circle'} size={14} />
                            </button>
                            <span className={t.completed ? 'line-through' : ''}>{t.name}</span>
                            {routine.isActive && !t.completed && !t.isDismissed && (
                              <>
                                {allowSnooze && (
                                  <button
                                    type="button"
                                    onClick={() => handleTaskSnooze(t._id)}
                                    disabled={loading || isSnoozed}
                                    className="ml-auto text-warning hover:underline disabled:opacity-50 text-xs"
                                    title={isSnoozed ? 'Already snoozed' : 'Snooze 5 min'}
                                  >
                                    {isSnoozed ? 'Snoozed' : 'Snooze'}
                                  </button>
                                )}
                                {allowDismiss && (
                                  <button
                                    type="button"
                                    onClick={() => handleTaskDismiss(t._id)}
                                    disabled={loading}
                                    className="text-error hover:underline text-xs"
                                    title="Dismiss"
                                  >
                                    Dismiss
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRoutinesManager;
