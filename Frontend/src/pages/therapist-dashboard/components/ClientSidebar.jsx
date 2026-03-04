import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import ClientCard from './ClientCard';

const ClientSidebar = ({ 
  clients, 
  selectedClient, 
  onClientSelect, 
  onAddClient,
  onClientSettings,
  accessibilitySettings 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const statusFilters = [
    { value: 'all', label: 'All Clients', count: clients.length },
    { value: 'excellent', label: 'Excellent', count: clients.filter(c => c.status === 'excellent').length },
    { value: 'active', label: 'Active', count: clients.filter(c => c.status === 'active').length },
    { value: 'needs-attention', label: 'Needs Attention', count: clients.filter(c => c.status === 'needs-attention').length }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.id ? String(client.id).toLowerCase() : '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getQuickStats = () => {
    const totalClients = clients.length;
    const avgCompletion = totalClients > 0
      ? Math.round(clients.reduce((sum, client) => sum + client.completionRate, 0) / totalClients)
      : 0;
    const totalUnread = clients.reduce((sum, client) => sum + client.unreadMessages, 0);
    
    return { totalClients, avgCompletion, totalUnread };
  };

  const stats = getQuickStats();

  return (
    <div className={`
      bg-surface border-r border-border h-full flex flex-col
      transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-80'}
      ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
    `}>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-text-primary">
              Clients
            </h2>
          )}
          <Button
            variant="ghost"
            iconName={isCollapsed ? 'ChevronRight' : 'ChevronLeft'}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2"
          />
        </div>

        {!isCollapsed && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="text-center p-2 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {stats.totalClients}
                </div>
                <div className="text-xs text-text-secondary">
                  Total
                </div>
              </div>
              <div className="text-center p-2 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {stats.avgCompletion}%
                </div>
                <div className="text-xs text-text-secondary">
                  Avg Rate
                </div>
              </div>
              <div className="text-center p-2 bg-surface-secondary rounded-lg">
                <div className="text-lg font-bold text-text-primary">
                  {stats.totalUnread}
                </div>
                <div className="text-xs text-text-secondary">
                  Messages
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-2">
              <Input
                type="search"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filters */}
            <div className="space-y-0.5">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                    ${statusFilter === filter.value
                      ? 'bg-primary-50 text-primary border border-primary-200' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                    }
                    ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                  `}
                  aria-pressed={statusFilter === filter.value}
                >
                  <span className="flex-1 text-left">{filter.label}</span>
                  <span className={`
                    w-7 text-center tabular-nums px-2 py-0.5 rounded-full text-xs font-medium shrink-0
                    ${statusFilter === filter.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-secondary text-text-tertiary'
                    }
                  `}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0">
        {isCollapsed ? (
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => onClientSelect(client)}
                className={`
                  w-full p-2 rounded-lg border transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary
                  ${selectedClient?.id === client.id
                    ? 'bg-primary-50 border-primary-300' :'bg-surface border-border hover:border-primary-200'
                  }
                  ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
                `}
                aria-label={`Select client ${client.name}`}
                title={client.name}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                  <span className="text-primary font-semibold text-xs">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                {client.unreadMessages > 0 && (
                  <div className="w-2 h-2 bg-error rounded-full mx-auto mt-1"></div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Icon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No clients found</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelectClient={onClientSelect}
                  isSelected={selectedClient?.id === client.id}
                  accessibilitySettings={accessibilitySettings}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border shrink-0">
          {onAddClient && (
            <Button
              variant="outline"
              iconName="Plus"
              iconPosition="left"
              onClick={onAddClient}
              className="w-full mb-2"
            >
              Add New Client
            </Button>
          )}
          {onClientSettings && (
            <Button
              variant="ghost"
              iconName="Settings"
              iconPosition="left"
              onClick={onClientSettings}
              disabled={!selectedClient}
              className="w-full text-sm"
              title={!selectedClient ? 'Select a client to view settings' : 'View client settings'}
            >
              Client Settings
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSidebar;