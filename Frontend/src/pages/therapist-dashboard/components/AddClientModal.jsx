import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import axiosClient from '../../../api/axiosClient';

const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const [email, setEmail] = useState('');
  const [lookup, setLookup] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setError('');
    setLookup(null);
    try {
      const { data } = await axiosClient.get(
        `/api/therapists/lookup-client?email=${encodeURIComponent(email.trim())}`
      );
      setLookup(data);
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || (err.response ? 'User not found' : 'Could not connect to server. Make sure the API is running on port 5000.');
      setError(msg);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!lookup) return;
    setAdding(true);
    setError('');
    try {
      await axiosClient.post('/api/therapists/clients', { userId: lookup.id });
      onClientAdded?.();
      onClose();
      setEmail('');
      setLookup(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add client');
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setLookup(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="add-client-title">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full border border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="add-client-title" className="text-lg font-semibold text-text-primary">
              Add New Client
            </h2>
            <Button variant="ghost" iconName="X" onClick={handleClose} aria-label="Close modal" />
          </div>

          <p className="text-sm text-text-secondary mb-4">
            Enter the email address of the user you want to add as your client.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="client@example.com"
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={searching || !email.trim()}
              iconName={searching ? 'Loader2' : 'Search'}
              iconPosition="left"
              className="w-full"
            >
              {searching ? 'Searching...' : 'Search User'}
            </Button>

            {error && (
              <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-800">
                {error}
              </div>
            )}

            {lookup && (
              <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm">
                        {lookup.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{lookup.name}</div>
                      <div className="text-xs text-text-secondary truncate">{lookup.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleAdd}
                    disabled={adding}
                    iconName={adding ? 'Loader2' : 'UserPlus'}
                    iconPosition="left"
                  >
                    {adding ? 'Adding...' : 'Add Client'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
