import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import ClientSidebar from './components/ClientSidebar';
import ClientOverviewGrid from './components/ClientOverviewGrid';
import AddClientModal from './components/AddClientModal';
import ClientSettingsModal from './components/ClientSettingsModal';
import ProgressCharts from './components/ProgressCharts';
import AlertSystem from './components/AlertSystem';
import MessagingIntegration from './components/MessagingIntegration';
import ClientRoutinesManager from './components/ClientRoutinesManager';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

const TherapistDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clients, setClients] = useState([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showClientSettingsModal, setShowClientSettingsModal] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  const loadClients = async () => {
    try {
      const { data } = await axiosClient.get('/api/therapists/clients/reports');
      const list = (data.reports || []).map((r) => ({
          id: (r.clientId && r.clientId.toString) ? r.clientId.toString() : r.clientId,
          name: r.name,
          completionRate: r.completionRate ?? 0,
          currentStreak: r.streak ?? 0,
          missedRoutines: r.missedRoutines ?? 0,
          lastActivity: (r.lastActivity || r.lastLogin) ? new Date(r.lastActivity || r.lastLogin) : null,
          status: r.status || 'active',
          unreadMessages: r.unreadMessages ?? 0,
          routines: [],
          goals: [],
        }));
      setClients(list);
    } catch (e) {
      setClients([]);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Load accessibility preferences
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAccessibilitySettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Check system preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setAccessibilitySettings(prev => ({
      ...prev,
      reducedMotion: prev.reducedMotion || reducedMotion,
      highContrast: prev.highContrast || highContrast
    }));
  }, []);

  const isTherapist = authUser?.role === 'therapist';

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    // Auto-switch to analytics view when client is selected on mobile
    if (window.innerWidth < 768) {
      setActiveView('analytics');
    }
  };

  const viewOptions = [
    { id: 'overview', label: 'Overview', icon: 'Grid3x3' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'routines', label: 'Routines', icon: 'Calendar' },
    { id: 'alerts', label: 'Alerts', icon: 'Bell' },
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' }
  ];

  const getOverviewStats = () => {
    const totalClients = clients.length;
    const avgCompletion = totalClients > 0
      ? Math.round(clients.reduce((sum, client) => sum + client.completionRate, 0) / totalClients)
      : 0;
    const needsAttention = clients.filter(c => c.status === 'needs-attention').length;
    const totalUnread = clients.reduce((sum, client) => sum + client.unreadMessages, 0);
    
    return { totalClients, avgCompletion, needsAttention, totalUnread };
  };

  const stats = getOverviewStats();

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <ClientOverviewGrid
            clients={clients}
            onClientSelect={handleClientSelect}
            selectedClient={selectedClient}
            onAddClient={isTherapist ? () => setShowAddClientModal(true) : undefined}
            accessibilitySettings={accessibilitySettings}
          />
        );
      case 'analytics':
        return (
          <ProgressCharts
            selectedClient={selectedClient}
            accessibilitySettings={accessibilitySettings}
          />
        );
      case 'routines':
        return (
          <ClientRoutinesManager
            clientId={selectedClient?.id}
            clientName={selectedClient?.name}
            onNavigateToBuilder={({ clientId: cid, routineId }) => {
              const params = new URLSearchParams();
              if (cid) params.set('clientId', cid);
              if (routineId) params.set('edit', routineId);
              navigate(`/routine-builder?${params.toString()}`);
            }}
            accessibilitySettings={accessibilitySettings}
          />
        );
      case 'alerts':
        return (
          <AlertSystem
            clients={clients}
            selectedClient={selectedClient}
            accessibilitySettings={accessibilitySettings}
          />
        );
      case 'messages':
        return (
          <MessagingIntegration
            selectedClient={selectedClient}
            accessibilitySettings={accessibilitySettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation />
      
      <main id="main-content" className="flex h-screen pt-[1rem]">
        {/* Sidebar */}
        <div className={`
          hidden lg:block transition-all duration-300
          ${sidebarCollapsed ? 'w-16' : 'w-80'}
          ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
        `}>
          <ClientSidebar
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={handleClientSelect}
            onAddClient={isTherapist ? () => setShowAddClientModal(true) : undefined}
            onClientSettings={isTherapist ? () => setShowClientSettingsModal(true) : undefined}
            accessibilitySettings={accessibilitySettings}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-surface border-b border-border px-4 py-3 md:px-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-0.5">
                  Therapist Dashboard
                </h1>
                <p className="text-text-secondary">
                  Monitor client progress and manage therapeutic interventions
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="text-center p-2.5 bg-surface-secondary rounded-lg">
                  <div className="text-xl font-bold text-text-primary">
                    {stats.totalClients}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Total Clients
                  </div>
                </div>
                <div className="text-center p-2.5 bg-surface-secondary rounded-lg">
                  <div className="text-xl font-bold text-text-primary">
                    {stats.avgCompletion}%
                  </div>
                  <div className="text-xs text-text-secondary">
                    Avg Completion
                  </div>
                </div>
                <div className="text-center p-2.5 bg-surface-secondary rounded-lg">
                  <div className="text-xl font-bold text-warning">
                    {stats.needsAttention}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Need Attention
                  </div>
                </div>
                <div className="text-center p-2.5 bg-surface-secondary rounded-lg">
                  <div className="text-xl font-bold text-primary">
                    {stats.totalUnread}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Unread Messages
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Navigation */}
          <div className="bg-surface border-b border-border px-4 md:px-5 py-1.5">
            <div className="flex flex-wrap gap-2">
              {viewOptions.map((view) => (
                <Button
                  key={view.id}
                  variant={activeView === view.id ? 'primary' : 'outline'}
                  iconName={view.icon}
                  iconPosition="left"
                  onClick={() => setActiveView(view.id)}
                  className="text-sm"
                >
                  {view.label}
                  {view.id === 'alerts' && stats.needsAttention > 0 && (
                    <span className="ml-2 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {stats.needsAttention}
                    </span>
                  )}
                  {view.id === 'messages' && stats.totalUnread > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {stats.totalUnread}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-5 min-h-0">
            {renderMainContent()}
          </div>
        </div>
      </main>

      {/* Mobile Client Selector */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <Button
          variant="primary"
          iconName="Users"
          onClick={() => {
            // Show mobile client selector modal
            console.log('Show mobile client selector');
          }}
          className="rounded-full w-14 h-14 shadow-lg"
          aria-label="Select client"
        />
      </div>

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onClientAdded={loadClients}
      />
      <ClientSettingsModal
        isOpen={showClientSettingsModal && !!selectedClient}
        clientId={selectedClient?.id}
        clientName={selectedClient?.name}
        onClose={() => setShowClientSettingsModal(false)}
      />

      {/* Accessibility Announcements */}
      <div 
        id="accessibility-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
};

export default TherapistDashboard;