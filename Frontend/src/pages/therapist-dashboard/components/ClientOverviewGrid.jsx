import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ClientOverviewGrid = ({ 
  clients, 
  onClientSelect, 
  selectedClient,
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
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.id.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Client Overview
          </h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-text-secondary">
                Excellent: {stats.excellent}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-text-secondary">
                Active: {stats.active}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-text-secondary">
                Needs Attention: {stats.needsAttention}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 lg:mt-0">
          <Button
            variant="primary"
            iconName="UserPlus"
            iconPosition="left"
            onClick={() => {/* Add new client functionality */}}
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
      <div className="hidden lg:grid lg:grid-cols-6 gap-4 pb-3 border-b border-border mb-4">
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
          <div className="text-center py-8 text-text-secondary">
            <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No clients found matching your criteria.</p>
          </div>
        ) : (
          filteredAndSortedClients.map((client) => (
            <div
              key={client.id}
              className={`
                grid grid-cols-1 lg:grid-cols-6 gap-4 p-4 rounded-lg border cursor-pointer
                transition-all duration-200 hover:shadow-sm
                ${selectedClient?.id === client.id 
                  ? 'bg-primary-50 border-primary-300' :'bg-surface border-border hover:border-primary-200'
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-text-primary">{client.name}</div>
                  <div className="text-sm text-text-secondary">ID: {client.id}</div>
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
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${client.status === 'excellent' ? 'text-success bg-success-50 border-success-200' :
                    client.status === 'needs-attention'? 'text-warning bg-warning-50 border-warning-200' : 'text-primary bg-primary-50 border-primary-200'}
                `}>
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
                {new Date(client.lastActivity).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientOverviewGrid;