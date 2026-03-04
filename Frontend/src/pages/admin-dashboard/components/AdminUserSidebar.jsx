import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const AdminUserSidebar = ({
  users,
  selectedUser,
  onUserSelect,
  accessibilitySettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = (users || []).filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.id ? String(u.id).toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users?.length ?? 0,
    avgCompletion:
      users?.length > 0
        ? Math.round(users.reduce((s, u) => s + (u.completionRate || 0), 0) / users.length)
        : 0
  };

  return (
    <div className="bg-surface border-r border-border h-full flex flex-col w-80 shrink-0">
      <div className="p-3 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Users</h2>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="text-center p-2 bg-surface-secondary rounded-lg">
            <div className="text-lg font-bold text-text-primary">{stats.total}</div>
            <div className="text-xs text-text-secondary">Total</div>
          </div>
          <div className="text-center p-2 bg-surface-secondary rounded-lg">
            <div className="text-lg font-bold text-text-primary">{stats.avgCompletion}%</div>
            <div className="text-xs text-text-secondary">Avg Rate</div>
          </div>
        </div>
        <Input
          type="search"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-2"
        />
        <div className="flex gap-1">
          {['all', 'excellent', 'active', 'needs-attention'].map((sf) => (
            <button
              key={sf}
              onClick={() => setStatusFilter(sf)}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium ${
                statusFilter === sf
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              {sf === 'all' ? 'All' : sf.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Icon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => onUserSelect(u)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  selectedUser?.id === u.id
                    ? 'bg-primary-50 border-primary-300'
                    : 'bg-surface border-border hover:border-primary-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {(u.name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text-primary truncate">{u.name || '—'}</div>
                  <div className="text-xs text-text-tertiary truncate">{u.email || '—'}</div>
                  <div className="text-xs text-text-tertiary truncate">{u.role || 'user'} • {u.uiMode?.name || 'Default'}</div>
                  <div className="text-xs text-text-tertiary truncate">{u.completionRate}% • {u.streak}d streak</div>
                </div>
                {u.unreadMessages > 0 && (
                  <div className="w-2 h-2 bg-error rounded-full shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserSidebar;
