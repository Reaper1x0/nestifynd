import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import ClientSidebar from './components/ClientSidebar';
import ClientOverviewGrid from './components/ClientOverviewGrid';
import ProgressCharts from './components/ProgressCharts';
import AlertSystem from './components/AlertSystem';
import MessagingIntegration from './components/MessagingIntegration';

const TherapistDashboard = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  // Mock clients data
  const [clients] = useState([
    {
      id: 'client-001',
      name: 'Sarah Johnson',
      completionRate: 85,
      currentStreak: 12,
      missedRoutines: 2,
      lastActivity: new Date(Date.now() - 3600000),
      status: 'excellent',
      unreadMessages: 1,
      routines: ['Morning Routine', 'Work Focus', 'Evening Wind-down'],
      goals: ['Improve sleep schedule', 'Reduce anxiety', 'Build consistent habits']
    },
    {
      id: 'client-002',
      name: 'Michael Chen',
      completionRate: 45,
      currentStreak: 0,
      missedRoutines: 8,
      lastActivity: new Date(Date.now() - 172800000),
      status: 'needs-attention',
      unreadMessages: 3,
      routines: ['ADHD Management', 'Study Schedule', 'Exercise'],
      goals: ['Focus improvement', 'Time management', 'Stress reduction']
    },
    {
      id: 'client-003',
      name: 'Emma Rodriguez',
      completionRate: 72,
      currentStreak: 5,
      missedRoutines: 3,
      lastActivity: new Date(Date.now() - 7200000),
      status: 'active',
      unreadMessages: 0,
      routines: ['Sensory Breaks', 'Social Skills', 'Daily Structure'],
      goals: ['Social interaction', 'Sensory regulation', 'Independence']
    },
    {
      id: 'client-004',
      name: 'David Kim',
      completionRate: 92,
      currentStreak: 18,
      missedRoutines: 1,
      lastActivity: new Date(Date.now() - 1800000),
      status: 'excellent',
      unreadMessages: 2,
      routines: ['Executive Function', 'Organization', 'Communication'],
      goals: ['Task completion', 'Organization skills', 'Self-advocacy']
    },
    {
      id: 'client-005',
      name: 'Lisa Thompson',
      completionRate: 38,
      currentStreak: 1,
      missedRoutines: 12,
      lastActivity: new Date(Date.now() - 259200000),
      status: 'needs-attention',
      unreadMessages: 5,
      routines: ['Anxiety Management', 'Sleep Hygiene', 'Mindfulness'],
      goals: ['Anxiety reduction', 'Better sleep', 'Emotional regulation']
    }
  ]);

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
    { id: 'alerts', label: 'Alerts', icon: 'Bell' },
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' }
  ];

  const getOverviewStats = () => {
    const totalClients = clients.length;
    const avgCompletion = Math.round(
      clients.reduce((sum, client) => sum + client.completionRate, 0) / totalClients
    );
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
      
      <main id="main-content" className="flex h-screen pt-32 md:pt-24">
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
            accessibilitySettings={accessibilitySettings}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-surface border-b border-border p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  Therapist Dashboard
                </h1>
                <p className="text-text-secondary">
                  Monitor client progress and manage therapeutic interventions
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-0">
                <div className="text-center p-3 bg-surface-secondary rounded-lg">
                  <div className="text-xl font-bold text-text-primary">
                    {stats.totalClients}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Total Clients
                  </div>
                </div>
                <div className="text-center p-3 bg-surface-secondary rounded-lg">
                  <div className="text-xl font-bold text-text-primary">
                    {stats.avgCompletion}%
                  </div>
                  <div className="text-xs text-text-secondary">
                    Avg Completion
                  </div>
                </div>
                <div className="text-center p-3 bg-surface-secondary rounded-lg">
                  <div className="text-xl font-bold text-warning">
                    {stats.needsAttention}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Need Attention
                  </div>
                </div>
                <div className="text-center p-3 bg-surface-secondary rounded-lg">
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
          <div className="bg-surface border-b border-border px-6 py-3">
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
          <div className="flex-1 overflow-auto p-6">
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