import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const AdminAIView = ({ accessibilitySettings }) => {
  const [config, setConfig] = useState({
    quotesInRemindersEnabled: false,
    useAIForQuotes: false,
    openaiApiKeyMasked: null,
    hasApiKey: false,
    apiKeySource: 'none'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/admin/ai-config');
      setConfig({
        quotesInRemindersEnabled: data.quotesInRemindersEnabled === true,
        useAIForQuotes: data.useAIForQuotes === true,
        openaiApiKeyMasked: data.openaiApiKeyMasked || null,
        hasApiKey: data.hasApiKey === true,
        apiKeySource: data.apiKeySource || 'none'
      });
    } catch {
      setConfig({
        quotesInRemindersEnabled: false,
        useAIForQuotes: false,
        openaiApiKeyMasked: null,
        hasApiKey: false,
        apiKeySource: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleToggle = async (field, value) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axiosClient.put('/api/admin/ai-config', { [field]: value });
      setConfig(prev => ({
        ...prev,
        quotesInRemindersEnabled: data.quotesInRemindersEnabled === true,
        useAIForQuotes: data.useAIForQuotes === true,
        openaiApiKeyMasked: data.openaiApiKeyMasked || null,
        hasApiKey: data.hasApiKey === true,
        apiKeySource: data.apiKeySource || 'none'
      }));
      setMessage({ type: 'success', text: 'AI settings saved.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axiosClient.put('/api/admin/ai-config', { openaiApiKey: apiKeyInput });
      setConfig(prev => ({
        ...prev,
        openaiApiKeyMasked: data.openaiApiKeyMasked || null,
        hasApiKey: data.hasApiKey === true,
        apiKeySource: data.apiKeySource || 'none'
      }));
      setApiKeyInput('');
      setShowApiKeyInput(false);
      setMessage({ type: 'success', text: apiKeyInput ? 'API key saved successfully.' : 'API key removed.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to save API key.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axiosClient.put('/api/admin/ai-config', { openaiApiKey: '' });
      setConfig(prev => ({
        ...prev,
        openaiApiKeyMasked: data.openaiApiKeyMasked || null,
        hasApiKey: data.hasApiKey === true,
        apiKeySource: data.apiKeySource || 'none'
      }));
      setMessage({ type: 'success', text: 'API key removed from database.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to remove API key.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
        <p className="text-text-secondary mt-2">Loading AI settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Key Configuration */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Icon name="Key" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">OpenAI API Key</h2>
            <p className="text-sm text-text-secondary">Configure the API key to enable AI features (chat, routine generation, AI quotes).</p>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Current Status */}
        <div className="p-4 bg-surface-secondary rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.hasApiKey ? 'bg-success' : 'bg-warning'}`} />
              <div>
                <p className="font-medium text-text-primary">
                  {config.hasApiKey ? 'API Key Configured' : 'No API Key'}
                </p>
                <p className="text-sm text-text-secondary">
                  {config.apiKeySource === 'database' && config.openaiApiKeyMasked && (
                    <>Key: {config.openaiApiKeyMasked} (stored in database)</>
                  )}
                  {config.apiKeySource === 'environment' && (
                    <>Using environment variable (OPENAI_API_KEY)</>
                  )}
                  {config.apiKeySource === 'none' && (
                    <>AI features are disabled until a key is configured</>
                  )}
                </p>
              </div>
            </div>
            {config.apiKeySource === 'database' && (
              <button
                type="button"
                onClick={handleRemoveApiKey}
                disabled={saving}
                className="text-sm text-error hover:text-error-700 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* API Key Input */}
        {showApiKeyInput ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Enter OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-text-secondary mt-1">
                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a>. The key is encrypted before storage.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveApiKey}
                disabled={saving || !apiKeyInput.trim()}
              >
                {saving ? 'Saving...' : 'Save Key'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowApiKeyInput(false); setApiKeyInput(''); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowApiKeyInput(true)}
          >
            <Icon name="Plus" size={16} className="mr-1" />
            {config.apiKeySource === 'database' ? 'Update API Key' : 'Add API Key'}
          </Button>
        )}
      </div>

      {/* Quotes Configuration */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Icon name="Sparkles" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">AI &amp; Motivational Quotes</h2>
            <p className="text-sm text-text-secondary">Control whether reminders include motivational quotes (when users have opted in).</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
            <div>
              <p className="font-medium text-text-primary">Quotes in reminders</p>
              <p className="text-sm text-text-secondary">When enabled, reminders can include a short motivational quote (users can opt in/out in Settings).</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('quotesInRemindersEnabled', !config.quotesInRemindersEnabled)}
              disabled={saving}
              className={`relative w-14 h-7 rounded-full transition-colors border-2 ${
                config.quotesInRemindersEnabled 
                  ? 'bg-primary border-primary' 
                  : 'bg-gray-300 border-gray-300'
              }`}
              aria-checked={config.quotesInRemindersEnabled}
              role="switch"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  config.quotesInRemindersEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
            <div>
              <p className="font-medium text-text-primary">Use AI for quotes</p>
              <p className="text-sm text-text-secondary">
                When on, quotes are generated with AI{!config.hasApiKey && ' (requires API key above)'}. When off, static quotes are used.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('useAIForQuotes', !config.useAIForQuotes)}
              disabled={saving || !config.hasApiKey}
              className={`relative w-14 h-7 rounded-full transition-colors border-2 ${
                config.useAIForQuotes 
                  ? 'bg-primary border-primary' 
                  : 'bg-gray-300 border-gray-300'
              } ${!config.hasApiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-checked={config.useAIForQuotes}
              role="switch"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  config.useAIForQuotes ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAIView;
