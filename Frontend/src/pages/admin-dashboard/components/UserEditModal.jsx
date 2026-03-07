import React, { useState, useEffect } from 'react';

import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import axiosClient from '../../../api/axiosClient';

const UserEditModal = ({ isOpen, user, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [roles, setRoles] = useState([]);
  const [uiModes, setUiModes] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    planId: '',
    roleId: '',
    uiModeId: ''
  });

  useEffect(() => {
    if (!isOpen || !user) return;
    setForm({
      planId: user.plan?._id || user.plan || '',
      roleId: user.role?._id || user.role || '',
      uiModeId: user.uiMode?._id || user.uiMode || ''
    });
    setMessage({ type: '', text: '' });
  }, [isOpen, user]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [plansRes, rolesRes, uiModesRes] = await Promise.all([
          axiosClient.get('/api/plans'),
          axiosClient.get('/api/roles'),
          axiosClient.get('/api/ui-modes')
        ]);
        setPlans(plansRes.data || []);
        setRoles(rolesRes.data || []);
        setUiModes(uiModesRes.data || []);
      } catch (e) {
        console.error('Failed to load options:', e);
      }
    };
    if (isOpen) loadOptions();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user) return;
    const loadRoutines = async () => {
      try {
        const { data } = await axiosClient.get('/api/admin/routines', {
          params: { userId: user._id }
        });
        setRoutines(Array.isArray(data) ? data : []);
      } catch (e) {
        setRoutines([]);
      }
    };
    loadRoutines();
  }, [isOpen, user]);

  const handleSavePlan = async () => {
    if (!user || !form.planId) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axiosClient.put('/api/admin/update-user-plan', {
        userId: user._id,
        planId: form.planId
      });
      setMessage({ type: 'success', text: 'Plan updated successfully' });
      onClose?.();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to update plan' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!user || !form.roleId) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axiosClient.put('/api/admin/assign-role', {
        userId: user._id,
        roleId: form.roleId
      });
      setMessage({ type: 'success', text: 'Role updated successfully' });
      onClose?.();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to assign role' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUiMode = async () => {
    if (!user) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axiosClient.put('/api/admin/assign-ui-mode', {
        userId: user._id,
        uiModeId: form.uiModeId || null
      });
      setMessage({ type: 'success', text: 'UI mode updated successfully' });
      onClose?.();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to assign UI mode' });
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!user || !window.confirm(`Downgrade ${user.name || user.email} to Free plan?`)) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axiosClient.put('/api/admin/downgrade', { userId: user._id });
      setMessage({ type: 'success', text: 'User downgraded to Free plan' });
      onClose?.();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to downgrade' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveRoutine = async (routineId) => {
    if (!user) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axiosClient.put('/api/admin/set-active-routine', {
        userId: user._id,
        routineId
      });
      setMessage({ type: 'success', text: 'Routine set as active' });
      setRoutines((prev) =>
        prev.map((r) => ({
          ...r,
          isActive: r._id === routineId
        }))
      );
      onClose?.();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to set active routine' });
    } finally {
      setLoading(false);
    }
  };

  const handleForceComplete = async (routineId) => {
    if (!window.confirm('Force complete this routine? All tasks will be marked completed.')) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axiosClient.put('/api/admin/force-complete-routine', { routineId });
      setMessage({ type: 'success', text: 'Routine force completed' });
      setRoutines((prev) => prev.map((r) => (r._id === routineId ? { ...r, isActive: false } : r)));
      onClose?.();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to force complete' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-surface rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Edit User</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-secondary text-text-secondary"
            aria-label="Close"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {user && (
            <>
              <div>
                <p className="text-sm text-text-secondary">User</p>
                <p className="font-medium text-text-primary">{user.name} ({user.email})</p>
              </div>

              {message.text && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-success-50 text-success-700'
                      : 'bg-error-50 text-error-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Plan</label>
                <div className="flex gap-2">
                  <select
                    value={form.planId}
                    onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
                  >
                    <option value="">Select plan</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - ${p.price || 0}/{p.interval || 'month'}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleSavePlan} disabled={loading}>
                    Update Plan
                  </Button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                <div className="flex gap-2">
                  <select
                    value={form.roleId}
                    onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
                  >
                    <option value="">Select role</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.displayName || r.name}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAssignRole} disabled={loading}>
                    Assign Role
                  </Button>
                </div>
              </div>

              {/* UI Mode */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">UI Mode</label>
                <div className="flex gap-2">
                  <select
                    value={form.uiModeId}
                    onChange={(e) => setForm((f) => ({ ...f, uiModeId: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
                  >
                    <option value="">Default (system)</option>
                    {uiModes.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.category})
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAssignUiMode} disabled={loading}>
                    Assign
                  </Button>
                </div>
              </div>

              {/* Downgrade */}
              <div>
                <Button variant="danger" onClick={handleDowngrade} disabled={loading} iconName="ArrowDownCircle">
                  Downgrade to Free Plan
                </Button>
              </div>

              {/* Routines: Set Active / Force Complete */}
              {routines.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Routines</label>
                  <div className="space-y-2">
                    {routines.map((r) => (
                      <div
                        key={r._id}
                        className="flex items-center justify-between p-2 bg-surface-secondary rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-text-primary">{r.title}</p>
                          <p className="text-xs text-text-secondary">
                            {r.user?.name || r.user?.email} • {r.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!r.isActive && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSetActiveRoutine(r._id)}
                              disabled={loading}
                            >
                              Set Active
                            </Button>
                          )}
                          {r.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleForceComplete(r._id)}
                              disabled={loading}
                            >
                              Force Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
