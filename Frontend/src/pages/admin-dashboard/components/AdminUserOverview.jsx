import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const AdminUserOverview = ({ users, selectedUser, onUserSelect, accessibilitySettings }) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'completionRate', label: 'Completion Rate' },
    { value: 'streak', label: 'Current Streak' },
    { value: 'lastActivity', label: 'Last Activity' }
  ];

  const filtered = (users || [])
    .filter((u) => {
      const matchesSearch =
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.id ? String(u.id).toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];
      if (sortBy === 'lastActivity') {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      }
      if (sortBy === 'name') {
        av = (av || '').toLowerCase();
        bv = (bv || '').toLowerCase();
      }
      return sortOrder === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

  const formatLastActivity = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const formatId = (id) => {
    if (!id) return '—';
    const s = String(id);
    return s.length > 10 ? `${s.slice(0, 6)}.${s.slice(-4)}` : s;
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4 md:p-5">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search users by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
        >
          <option value="all">All Users</option>
          <option value="excellent">Excellent</option>
          <option value="active">Active</option>
          <option value="needs-attention">Needs Attention</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              Sort by {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Column headers - visible on md+ */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-text-secondary border-b border-border">
        <div className="col-span-2">Name</div>
        <div className="col-span-2">Email</div>
        <div className="col-span-1">Role</div>
        <div className="col-span-1">Plan</div>
        <div className="col-span-1">UI Mode</div>
        <div className="col-span-1">Completion</div>
        <div className="col-span-1">Streak</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2">Last Activity</div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Icon name="Users" size={40} className="mx-auto mb-3 opacity-40" />
            <p>No users found.</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.id}
              onClick={() => onUserSelect(u)}
              className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-3 rounded-lg border cursor-pointer transition-all ${
                selectedUser?.id === u.id
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-surface border-border hover:border-primary-200 hover:bg-primary-50/50'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onUserSelect(u);
                }
              }}
            >
              <div className="flex items-center gap-3 min-w-0 md:col-span-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {(u.name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-text-primary truncate">{u.name || '—'}</div>
                  <div className="text-xs text-text-tertiary md:hidden">ID: {formatId(u.id)} • {u.role || 'user'}</div>
                </div>
              </div>
              <div className="text-sm text-text-secondary md:col-span-2 truncate">
                <span className="md:hidden text-text-tertiary">Email: </span>{u.email || '—'}
              </div>
              <div className="text-sm text-text-primary md:col-span-1">
                <span className="md:hidden text-text-tertiary">Role: </span>{u.role || 'user'}
              </div>
              <div className="text-sm text-text-secondary md:col-span-1 truncate">
                <span className="md:hidden text-text-tertiary">Plan: </span>{u.plan?.name || '—'}
              </div>
              <div className="text-sm text-text-secondary md:col-span-1 truncate">
                <span className="md:hidden text-text-tertiary">UI Mode: </span>{u.uiMode?.name || 'Default'}
              </div>
              <div className="md:col-span-1">
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="md:hidden text-text-secondary">Completion:</span>
                  <span className="font-medium text-text-primary">{u.completionRate}%</span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${u.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 md:col-span-1">
                <Icon name="Flame" size={16} className="text-warning shrink-0" />
                <span className="font-medium text-text-primary">{u.streak} days</span>
              </div>
              <div className="md:col-span-1">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.status === 'excellent'
                      ? 'text-success-700 bg-success-50'
                      : u.status === 'needs-attention'
                      ? 'text-warning-700 bg-warning-50'
                      : 'text-primary-700 bg-primary-50'
                  }`}
                >
                  {u.status?.replace('-', ' ') || 'active'}
                </span>
              </div>
              <div className="text-sm text-text-secondary md:col-span-2">
                <span className="md:hidden text-text-tertiary">Last activity: </span>{formatLastActivity(u.lastActivity)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserOverview;
