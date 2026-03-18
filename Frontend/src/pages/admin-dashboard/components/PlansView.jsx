import React, { useState, useEffect } from 'react';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const PlansView = ({ accessibilitySettings, onUpdate }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/plans');
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      price: plan.price ?? 0,
      interval: plan.interval || 'month',
      isActive: plan.isActive !== false,
      features: Array.isArray(plan.features) ? [...plan.features] : [],
      limits: {
        therapist: {
          allowed: plan.limits?.therapist?.allowed ?? false,
          maxAllowed: plan.limits?.therapist?.maxAllowed ?? 0
        },
        caregiver: {
          allowed: plan.limits?.caregiver?.allowed ?? false,
          maxAllowed: plan.limits?.caregiver?.maxAllowed ?? 0
        },
        allowAIRoutine: plan.limits?.allowAIRoutine ?? false,
        allowAIChat: plan.limits?.allowAIChat ?? false,
        routines: plan.limits?.routines ?? 1,
        tasksPerRoutine: plan.limits?.tasksPerRoutine ?? 5
      },
      customization: {
        allowColorChanges: plan.customization?.allowColorChanges !== false,
        allowThemeChanges: plan.customization?.allowThemeChanges !== false
      }
    });
    setError(null);
  };

  const closeEdit = () => {
    setEditingPlan(null);
    setFormData(null);
    setError(null);
  };

  const updateField = (path, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (path === 'name') next.name = value;
      else if (path === 'price') next.price = parseFloat(value) || 0;
      else if (path === 'interval') next.interval = value;
      else if (path === 'isActive') next.isActive = value;
      else if (path === 'limits.therapist.allowed') next.limits.therapist = { ...next.limits.therapist, allowed: value };
      else if (path === 'limits.therapist.maxAllowed') next.limits.therapist = { ...next.limits.therapist, maxAllowed: Math.max(0, parseInt(value, 10) || 0) };
      else if (path === 'limits.caregiver.allowed') next.limits.caregiver = { ...next.limits.caregiver, allowed: value };
      else if (path === 'limits.caregiver.maxAllowed') next.limits.caregiver = { ...next.limits.caregiver, maxAllowed: Math.max(0, parseInt(value, 10) || 0) };
      else if (path === 'limits.allowAIRoutine') next.limits = { ...next.limits, allowAIRoutine: value };
      else if (path === 'limits.allowAIChat') next.limits = { ...next.limits, allowAIChat: value };
      else if (path === 'limits.routines') next.limits.routines = Math.max(0, parseInt(value, 10) || 1);
      else if (path === 'limits.tasksPerRoutine') next.limits.tasksPerRoutine = Math.max(0, parseInt(value, 10) || 5);
      else if (path === 'customization.allowColorChanges') next.customization = { ...next.customization, allowColorChanges: value };
      else if (path === 'customization.allowThemeChanges') next.customization = { ...next.customization, allowThemeChanges: value };
      return next;
    });
  };

  const handleSave = async () => {
    if (!editingPlan || !formData) return;
    setSaving(true);
    setError(null);
    try {
      await axiosClient.put(`/api/plans/${editingPlan._id}`, formData);
      closeEdit();
      await load();
      if (onUpdate) onUpdate();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-text-secondary animate-pulse-gentle">
        Loading plans...
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <Icon name="CreditCard" size={48} className="mx-auto mb-3 opacity-50" />
        <p>No plans configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p._id}
            className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{p.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${p.isActive !== false ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}>
                  {p.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="Pencil"
                onClick={() => openEdit(p)}
                aria-label={`Edit ${p.name} plan`}
              >
                Edit
              </Button>
            </div>
            <p className="text-2xl font-bold text-primary mt-2">
              ${p.price ?? 0}
              <span className="text-sm font-normal text-text-secondary">/{p.interval || 'month'}</span>
            </p>
            <div className="mt-3 text-sm text-text-secondary space-y-1">
              <div>Routines: {p.limits?.routines ?? 1} · Tasks/routine: {p.limits?.tasksPerRoutine ?? 5}</div>
              <div>Therapist: {p.limits?.therapist?.allowed ? `Yes (max ${p.limits.therapist.maxAllowed})` : 'No'}</div>
              <div>Caregiver: {p.limits?.caregiver?.allowed ? `Yes (max ${p.limits.caregiver.maxAllowed})` : 'No'}</div>
              <div>AI Routine: {p.limits?.allowAIRoutine ? 'Yes' : 'No'} · AI Chat: {p.limits?.allowAIChat ? 'Yes' : 'No'}</div>
              <div>Color/Theme: {p.customization?.allowColorChanges ? 'Colors' : ''} {p.customization?.allowThemeChanges ? 'Theme' : ''}</div>
            </div>
            {p.features && p.features.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-text-secondary">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon name="Check" size={14} className="text-success-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="edit-plan-title">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-black/5">
            {/* Header */}
            <div className="px-6 py-5 flex justify-between items-center border-b border-border bg-surface-secondary/50">
              <h2 id="edit-plan-title" className="text-xl font-semibold text-text-primary">
                Edit Plan: {editingPlan.name}
              </h2>
              <button
                onClick={closeEdit}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                aria-label="Close"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-warning-50 border border-warning-200 text-warning-800 text-sm flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Basic info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Plan name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Interval</label>
                    <select
                      value={formData.interval}
                      onChange={(e) => updateField('interval', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                    >
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 py-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-text-primary group-hover:text-text-secondary">Plan active</span>
                </label>
              </div>

              {/* Limits */}
              <div className="rounded-xl bg-surface-secondary/50 border border-border p-5 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Limits</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.limits.therapist.allowed}
                        onChange={(e) => updateField('limits.therapist.allowed', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                      />
                      <span className="text-sm font-medium">Therapist</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.limits.therapist.maxAllowed}
                      onChange={(e) => updateField('limits.therapist.maxAllowed', e.target.value)}
                      className="w-16 px-3 py-2 rounded-lg border border-border bg-background text-text-primary text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.limits.caregiver.allowed}
                        onChange={(e) => updateField('limits.caregiver.allowed', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                      />
                      <span className="text-sm font-medium">Caregiver</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.limits.caregiver.maxAllowed}
                      onChange={(e) => updateField('limits.caregiver.maxAllowed', e.target.value)}
                      className="w-16 px-3 py-2 rounded-lg border border-border bg-background text-text-primary text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <span className="text-sm font-medium text-text-primary">Routines max</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.limits.routines}
                      onChange={(e) => updateField('limits.routines', e.target.value)}
                      className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-text-primary text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-text-primary">Tasks per routine</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.limits.tasksPerRoutine}
                      onChange={(e) => updateField('limits.tasksPerRoutine', e.target.value)}
                      className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-text-primary text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="pt-2 space-y-3 border-t border-border mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.limits.allowAIRoutine ?? false}
                      onChange={(e) => updateField('limits.allowAIRoutine', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    <span className="text-sm font-medium">Allow AI Routine</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.limits.allowAIChat ?? false}
                      onChange={(e) => updateField('limits.allowAIChat', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    <span className="text-sm font-medium">Allow AI Chat (AI Assistant)</span>
                  </label>
                </div>
              </div>

              {/* Customization */}
              <div className="rounded-xl bg-surface-secondary/50 border border-border p-5 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Customization</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.customization.allowColorChanges}
                      onChange={(e) => updateField('customization.allowColorChanges', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    <span className="text-sm font-medium">Allow color changes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.customization.allowThemeChanges}
                      onChange={(e) => updateField('customization.allowThemeChanges', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    <span className="text-sm font-medium">Allow theme changes</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface-secondary/30">
              <Button variant="outline" onClick={closeEdit}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} iconName={saving ? 'Loader2' : 'Save'}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansView;
