import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ClientOverviewGrid = ({ 
  clients, 
  onClientSelect, 
  selectedClient,
  onAddClient,
  accessibilitySettings 
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'completionRate', label: 'Completion Rate' },
    { value: 'currentStreak', label: 'Current Streak' },
    { value: 'lastActivity', label: 'Last Activity' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Clients' },
    { value: 'excellent', label: 'Excellent Progress' },
    { value: 'active', label: 'Active' },
    { value: 'needs-attention', label: 'Needs Attention' }
  ];

  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch = (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (client.id ? String(client.id).toLowerCase() : '').includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'lastActivity') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: clients.length,
      excellent: clients.filter(c => c.status === 'excellent').length,
      active: clients.filter(c => c.status === 'active').length,
      needsAttention: clients.filter(c => c.status === 'needs-attention').length
    };
    return stats;
  };

  const stats = getStatusStats();

  const formatClientId = (id) => {
    if (!id) return '—';
    const str = String(id);
    return str.length > 10 ? `${str.slice(0, 6)}.${str.slice(-4)}` : str;
  };

  const formatLastActivity = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4 md:p-5">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Client Overview
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className="w-2.5 h-2.5 bg-success rounded-full shrink-0" />
              <span className="text-text-secondary">Excellent</span>
              <span className="font-medium text-text-primary tabular-nums">{stats.excellent}</span>
            </div>
            <div className="flex items-center gap-2 min-w-[100px]">
              <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0" />
              <span className="text-text-secondary">Active</span>
              <span className="font-medium text-text-primary tabular-nums">{stats.active}</span>
            </div>
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className="w-2.5 h-2.5 bg-warning rounded-full shrink-0" />
              <span className="text-text-secondary">Needs Attention</span>
              <span className="font-medium text-text-primary tabular-nums">{stats.needsAttention}</span>
            </div>
          </div>
        </div>
        
        {onAddClient && (
          <div className="mt-4 lg:mt-0">
            <Button
              variant="primary"
              iconName="UserPlus"
              iconPosition="left"
              onClick={onAddClient}
            >
              Add Client
            </Button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search clients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
            aria-label="Filter by status"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
            aria-label="Sort by"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            iconName={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-4 pb-2 border-b border-border mb-2">
        <button
          onClick={() => handleSort('name')}
          className="flex items-center space-x-1 text-left text-sm font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          <span>Client</span>
          {sortBy === 'name' && (
            <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={16} />
          )}
        </button>
        
        <button
          onClick={() => handleSort('completionRate')}
          className="flex items-center space-x-1 text-left text-sm font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          <span>Completion</span>
          {sortBy === 'completionRate' && (
            <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={16} />
          )}
        </button>
        
        <button
          onClick={() => handleSort('currentStreak')}
          className="flex items-center space-x-1 text-left text-sm font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          <span>Streak</span>
          {sortBy === 'currentStreak' && (
            <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={16} />
          )}
        </button>
        
        <span className="text-sm font-medium text-text-secondary">Status</span>
        <span className="text-sm font-medium text-text-secondary">Messages</span>
        
        <button
          onClick={() => handleSort('lastActivity')}
          className="flex items-center space-x-1 text-left text-sm font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          <span>Last Activity</span>
          {sortBy === 'lastActivity' && (
            <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={16} />
          )}
        </button>
      </div>

      {/* Client Rows */}
      <div className="space-y-2">
        {filteredAndSortedClients.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Icon name="Users" size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No clients found matching your criteria.</p>
          </div>
        ) : (
          filteredAndSortedClients.map((client) => (
            <div
              key={client.id}
              className={`
                grid grid-cols-1 lg:grid-cols-6 gap-4 items-center p-3 rounded-lg border cursor-pointer
                transition-all duration-200
                ${selectedClient?.id === client.id 
                  ? 'bg-primary-50 border-primary-200' : 'bg-surface border-border hover:border-primary-200 hover:bg-primary-50/50'
                }
                ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
              `}
              onClick={() => onClientSelect(client)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedClient?.id === client.id}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClientSelect(client);
                }
              }}
            >
              {/* Client Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {(client.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-text-primary truncate">{client.name || '—'}</div>
                  <div className="text-xs text-text-tertiary font-mono truncate" title={client.id}>ID: {formatClientId(client.id)}</div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="lg:hidden text-text-secondary">Completion:</span>
                    <span className="font-medium text-text-primary">{client.completionRate}%</span>
                  </div>
                  <div className="w-full bg-surface-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${client.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <span className="lg:hidden text-text-secondary">Streak:</span>
                  <Icon name="Flame" size={16} className="text-warning" />
                  <span className="font-medium text-text-primary">{client.currentStreak} days</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <span className={`
                  inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
                  ${client.status === 'excellent' ? 'text-success-700 bg-success-50' :
                    client.status === 'needs-attention' ? 'text-warning-700 bg-warning-50' :
                    'text-primary-700 bg-primary-50'}
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    client.status === 'excellent' ? 'bg-success' :
                    client.status === 'needs-attention' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  {client.status.replace('-', ' ')}
                </span>
              </div>

              {/* Messages */}
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Icon name="MessageCircle" size={16} className="text-text-secondary" />
                  <span className="text-text-primary">{client.unreadMessages}</span>
                  {client.unreadMessages > 0 && (
                    <span className="text-xs text-error">unread</span>
                  )}
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center text-sm text-text-secondary">
                <span className="lg:hidden mr-2">Last activity:</span>
                {formatLastActivity(client.lastActivity)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientOverviewGrid;