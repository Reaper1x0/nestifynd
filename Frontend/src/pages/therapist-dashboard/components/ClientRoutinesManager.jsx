import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const ClientRoutinesManager = ({ clientId, clientName, onNavigateToBuilder, accessibilitySettings }) => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadRoutines = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/api/routines/user/${clientId}`);
      setRoutines(Array.isArray(data) ? data : []);
    } catch {
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [clientId]);

  const handleSetActive = async (routineId) => {
    setActionLoading(routineId);
    try {
      await axiosClient.patch(`/api/routines/user/${clientId}/${routineId}/activate`);
      setRoutines((prev) =>
        prev.map((r) => ({ ...r, isActive: r._id === routineId }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (routineId, title) => {
    if (!window.confirm(`Delete routine "${title || 'Untitled'}"? This cannot be undone.`)) return;
    setActionLoading(routineId);
    try {
      await axiosClient.delete(`/api/routines/user/${clientId}/${routineId}`);
      setRoutines((prev) => prev.filter((r) => r._id !== routineId));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = () => {
    onNavigateToBuilder?.({ clientId, clientName, mode: 'create' });
  };

  const handleEdit = (routineId) => {
    onNavigateToBuilder?.({ clientId, clientName, routineId, mode: 'edit' });
  };

  if (!clientId) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="User" size={40} className="mx-auto mb-3 text-text-tertiary" />
        <p className="text-text-secondary">Select a client to manage their routines.</p>
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
          <h2 className="text-lg font-semibold text-text-primary">Client Routines</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage routines for {clientName || 'client'}
          </p>
        </div>
        <Button
          variant="primary"
          iconName="Plus"
          iconPosition="left"
          onClick={handleCreate}
        >
          Create Routine
        </Button>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Icon name="Calendar" size={48} className="mx-auto mb-3 text-text-tertiary" />
          <p className="text-text-secondary mb-4">No routines yet for this client.</p>
          <Button variant="primary" iconName="Plus" iconPosition="left" onClick={handleCreate}>
            Create First Routine
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine) => (
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
                    routine.isActive
                      ? 'text-primary bg-primary-50'
                      : 'text-text-secondary bg-surface'
                  }`}
                >
                  {routine.isActive ? 'Active' : 'Scheduled'}
                </span>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                {routine.description || 'No description'}
              </p>
              <div className="flex items-center text-sm text-text-tertiary mb-4">
                <Icon name="Clock" size={14} className="mr-1" />
                {routine.schedule?.startTime || '--:--'}
                {routine.schedule?.daysOfWeek?.length > 0 && (
                  <span className="ml-2">
                    · {routine.schedule.daysOfWeek.length} days
                  </span>
                )}
                {Array.isArray(routine.tasks) && (
                  <span className="ml-2">· {routine.tasks.length} tasks</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(routine._id)}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(routine._id, routine.title || routine.name)}
                  disabled={actionLoading === routine._id}
                  iconName="Trash2"
                  iconPosition="left"
                  className="text-error hover:text-error hover:bg-error-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientRoutinesManager;
