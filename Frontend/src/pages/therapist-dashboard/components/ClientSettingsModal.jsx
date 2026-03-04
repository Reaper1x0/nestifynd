import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const ClientSettingsModal = ({ isOpen, clientId, clientName, onClose }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !clientId) return;
    setLoading(true);
    setError('');
    setSettings(null);
    axiosClient
      .get(`/api/therapists/clients/${clientId}/settings`)
      .then(({ data }) => setSettings(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, [isOpen, clientId]);

  const formatSettingValue = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      if (Array.isArray(value)) return value.join(', ') || '—';
      if (value.start !== undefined && value.end !== undefined) return `${value.start} – ${value.end}`;
      return JSON.stringify(value).length > 80 ? JSON.stringify(value).slice(0, 80) + '…' : JSON.stringify(value);
    }
    return String(value) || '—';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-settings-title"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-xl max-w-lg w-full border border-border max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 id="client-settings-title" className="text-lg font-semibold text-text-primary">
              Client Settings: {clientName || 'Loading...'}
            </h2>
            <Button variant="ghost" iconName="X" onClick={onClose} aria-label="Close modal" />
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-sm text-error-800">
              {error}
            </div>
          )}

          {!loading && !error && settings && (
            <div className="space-y-6">
              {/* Profile */}
              <section>
                <h3 className="text-sm font-medium text-text-primary mb-3">Profile</h3>
                <div className="p-4 bg-surface-secondary rounded-lg border border-border space-y-2">
                  <div><span className="text-text-secondary text-sm">Name:</span> <span className="text-text-primary">{settings.name || '—'}</span></div>
                  <div><span className="text-text-secondary text-sm">Email:</span> <span className="text-text-primary">{settings.email || '—'}</span></div>
                  <div><span className="text-text-secondary text-sm">Phone:</span> <span className="text-text-primary">{settings.phoneNumber || '—'}</span></div>
                </div>
              </section>

              {/* Emergency Contact */}
              <section>
                <h3 className="text-sm font-medium text-text-primary mb-3">Emergency Contact</h3>
                <div className="p-4 bg-surface-secondary rounded-lg border border-border space-y-2">
                  <div><span className="text-text-secondary text-sm">Name:</span> <span className="text-text-primary">{settings.emergencyContact?.name || '—'}</span></div>
                  <div><span className="text-text-secondary text-sm">Phone:</span> <span className="text-text-primary">{settings.emergencyContact?.phone || '—'}</span></div>
                </div>
              </section>

              {/* Preferences */}
              {settings.settings && Object.keys(settings.settings).length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Preferences</h3>
                  <div className="p-4 bg-surface-secondary rounded-lg border border-border space-y-2">
                    {Object.entries(settings.settings).map(([key, value]) => {
                      const displayValue = (() => {
                        if (key === 'profileName' && (!value || String(value).trim() === '')) return settings.name;
                        if (key === 'profileEmail' && (!value || String(value).trim() === '')) return settings.email;
                        if (key === 'profilePhone' && (!value || String(value).trim() === '')) return settings.phoneNumber;
                        if (key === 'emergencyContact' && (!value || String(value).trim() === '')) return settings.emergencyContact?.name;
                        if (key === 'emergencyPhone' && (!value || String(value).trim() === '')) return settings.emergencyContact?.phone;
                        return value;
                      })();
                      return (
                        <div key={key} className="flex justify-between gap-4">
                          <span className="text-text-secondary text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="text-text-primary text-sm truncate max-w-[60%] text-right">
                            {formatSettingValue(displayValue)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSettingsModal;
